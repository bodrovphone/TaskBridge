/**
 * Lead filtering: extract email, drop chains/noise, dedupe against existing data.
 */

import type { ApifyRawLead } from './apify'
import type { SupabaseClient } from '@supabase/supabase-js'

export interface NormalizedLead {
  business_name: string
  email: string
  phone: string | null
  website: string | null
  gmaps_url: string | null
  rating: number | null
  reviews_count: number | null
  raw_data: Record<string, unknown>
}

export type SkipReason =
  | 'no_email'
  | 'invalid_email'
  | 'chain_brand'
  | 'noisy_address'    // info@/office@ etc — currently disabled
  | 'already_user'
  | 'recent_outreach'
  | 'suppressed'
  | 'duplicate_in_batch'

/**
 * Big-brand chains we never want to email. Lowercased substring match against
 * business name. Keep this short and surgical — false positives drop real leads.
 */
const CHAIN_BRANDS: readonly string[] = [
  'praktiker',
  'mr. bricolage',
  'mr.bricolage',
  'mrbricolage',
  'leroy merlin',
  'bauhaus',
  'metro cash',
  'kaufland',
  'lidl',
  'billa',
  'fantastico',
  't market',
  'технополис',
  'технопо лис',
  'technopolis',
  'jumbo',
  'ikea',
  'home max',
  'homemax',
]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function extractEmail(raw: ApifyRawLead): string | null {
  const candidates: string[] = []
  if (typeof raw.email === 'string') candidates.push(raw.email)
  if (Array.isArray(raw.emails)) {
    for (const e of raw.emails) {
      if (typeof e === 'string') candidates.push(e)
    }
  }
  // Some actors expose contact emails under nested keys
  const contacts = (raw as { contacts?: { emails?: unknown[] } }).contacts
  if (contacts?.emails && Array.isArray(contacts.emails)) {
    for (const e of contacts.emails) {
      if (typeof e === 'string') candidates.push(e)
    }
  }

  for (const c of candidates) {
    const trimmed = c.trim().toLowerCase()
    if (EMAIL_RE.test(trimmed)) return trimmed
  }
  return null
}

export function isChainBrand(name: string): boolean {
  const n = name.toLowerCase()
  return CHAIN_BRANDS.some((b) => n.includes(b))
}

export function normalize(raw: ApifyRawLead): NormalizedLead | null {
  const email = extractEmail(raw)
  if (!email) return null
  const business_name = (raw.title ?? '').trim()
  if (!business_name) return null

  return {
    business_name,
    email,
    phone: typeof raw.phone === 'string' ? raw.phone : null,
    website: typeof raw.website === 'string' ? raw.website : null,
    gmaps_url: typeof raw.url === 'string' ? raw.url : null,
    rating: typeof raw.totalScore === 'number' ? raw.totalScore : null,
    reviews_count: typeof raw.reviewsCount === 'number' ? raw.reviewsCount : null,
    raw_data: raw as Record<string, unknown>,
  }
}

export interface FilterContext {
  supabase: SupabaseClient
  recentOutreachWindowDays: number    // default 90
}

export interface FilterResult {
  kept: NormalizedLead[]
  skipped: Array<{ raw: ApifyRawLead; reason: SkipReason; email: string | null }>
}

export async function filterLeads(
  raws: ApifyRawLead[],
  ctx: FilterContext,
): Promise<FilterResult> {
  const kept: NormalizedLead[] = []
  const skipped: FilterResult['skipped'] = []
  const seenInBatch = new Set<string>()

  // Stage 1: shape + email + chain
  const stage1: NormalizedLead[] = []
  for (const raw of raws) {
    const norm = normalize(raw)
    if (!norm) {
      skipped.push({ raw, reason: 'no_email', email: null })
      continue
    }
    if (isChainBrand(norm.business_name)) {
      skipped.push({ raw, reason: 'chain_brand', email: norm.email })
      continue
    }
    if (seenInBatch.has(norm.email)) {
      skipped.push({ raw, reason: 'duplicate_in_batch', email: norm.email })
      continue
    }
    seenInBatch.add(norm.email)
    stage1.push(norm)
  }

  if (stage1.length === 0) return { kept, skipped }

  const emails = stage1.map((l) => l.email)

  // Stage 2: drop emails that are already TruDify users
  const { data: existingUsers, error: usersErr } = await ctx.supabase
    .from('users')
    .select('email')
    .in('email', emails)
  if (usersErr) throw new Error(`users lookup failed: ${usersErr.message}`)
  const userEmails = new Set((existingUsers ?? []).map((u) => (u.email as string).toLowerCase()))

  // Stage 3: drop emails in suppression list
  const { data: suppressed, error: supErr } = await ctx.supabase
    .from('outreach_suppression')
    .select('email')
    .in('email', emails)
  if (supErr) throw new Error(`suppression lookup failed: ${supErr.message}`)
  const suppressedEmails = new Set((suppressed ?? []).map((r) => (r.email as string).toLowerCase()))

  // Stage 4: drop emails sent within the recent window
  const cutoff = new Date(Date.now() - ctx.recentOutreachWindowDays * 24 * 60 * 60 * 1000).toISOString()
  const { data: recent, error: recentErr } = await ctx.supabase
    .from('outreach_leads')
    .select('email')
    .in('email', emails)
    .gte('sent_at', cutoff)
    .not('sent_at', 'is', null)
  if (recentErr) throw new Error(`recent outreach lookup failed: ${recentErr.message}`)
  const recentEmails = new Set((recent ?? []).map((r) => (r.email as string).toLowerCase()))

  for (const lead of stage1) {
    if (userEmails.has(lead.email)) {
      skipped.push({ raw: lead.raw_data as ApifyRawLead, reason: 'already_user', email: lead.email })
      continue
    }
    if (suppressedEmails.has(lead.email)) {
      skipped.push({ raw: lead.raw_data as ApifyRawLead, reason: 'suppressed', email: lead.email })
      continue
    }
    if (recentEmails.has(lead.email)) {
      skipped.push({ raw: lead.raw_data as ApifyRawLead, reason: 'recent_outreach', email: lead.email })
      continue
    }
    kept.push(lead)
  }

  return { kept, skipped }
}

export function summarizeSkipped(
  skipped: FilterResult['skipped'],
): Record<SkipReason, number> {
  const out: Record<string, number> = {}
  for (const s of skipped) {
    out[s.reason] = (out[s.reason] ?? 0) + 1
  }
  return out as Record<SkipReason, number>
}
