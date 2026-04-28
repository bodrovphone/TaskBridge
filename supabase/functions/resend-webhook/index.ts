/**
 * Resend webhook handler.
 *
 * Receives Svix-signed webhooks from Resend (https://resend.com/docs/dashboard/webhooks)
 * and updates outreach_leads accordingly. Bounces and complaints also get added
 * to the global outreach_suppression list.
 *
 * Deploy:
 *   Use the Supabase MCP `deploy_edge_function` with verify_jwt=false (Resend
 *   doesn't send a Supabase JWT — we verify the Svix signature ourselves).
 *
 * Env vars (set in Supabase project secrets, not .env.local):
 *   RESEND_WEBHOOK_SECRET   — Svix signing secret from Resend dashboard
 *   SUPABASE_URL            — auto-injected by Supabase
 *   SUPABASE_SERVICE_ROLE_KEY — auto-injected by Supabase
 */

import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

interface ResendEventBase {
  type: string
  created_at: string
  data: {
    email_id?: string
    to?: string[] | string
    [key: string]: unknown
  }
}

const ALLOWED_EVENTS = new Set([
  'email.sent',
  'email.delivered',
  'email.opened',
  'email.clicked',
  'email.bounced',
  'email.complained',
  'email.delivery_delayed',
])

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const secret = Deno.env.get('RESEND_WEBHOOK_SECRET')
  if (!secret) {
    return new Response('Server misconfigured: RESEND_WEBHOOK_SECRET missing', { status: 500 })
  }

  const rawBody = await req.text()
  const svixId = req.headers.get('svix-id')
  const svixTimestamp = req.headers.get('svix-timestamp')
  const svixSignature = req.headers.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response('Missing Svix headers', { status: 400 })
  }

  // Reject events older than 5 minutes (replay defense)
  const ts = parseInt(svixTimestamp, 10)
  if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > 300) {
    return new Response('Stale webhook', { status: 400 })
  }

  const ok = await verifySvixSignature(secret, svixId, svixTimestamp, rawBody, svixSignature)
  if (!ok) {
    return new Response('Bad signature', { status: 401 })
  }

  let event: ResendEventBase
  try {
    event = JSON.parse(rawBody) as ResendEventBase
  } catch {
    return new Response('Invalid JSON', { status: 400 })
  }

  if (!ALLOWED_EVENTS.has(event.type)) {
    return new Response(JSON.stringify({ ignored: event.type }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const messageId = event.data.email_id
  if (!messageId) {
    return new Response('No email_id in event', { status: 400 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { persistSession: false } },
  )

  // Lookup the lead by resend_message_id
  const { data: lead, error: lookupErr } = await supabase
    .from('outreach_leads')
    .select('id, email, status')
    .eq('resend_message_id', messageId)
    .maybeSingle()

  if (lookupErr) {
    return new Response(`Lookup failed: ${lookupErr.message}`, { status: 500 })
  }
  if (!lead) {
    // Webhook for an email we don't have a lead for (e.g., a transactional send).
    // Acknowledge and move on — Resend will keep retrying on non-200.
    return new Response(JSON.stringify({ skipped: 'unknown_message_id' }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const now = new Date().toISOString()
  const update: Record<string, unknown> = {}

  // State machine — only advance status forward.
  switch (event.type) {
    case 'email.sent':
    case 'email.delivered':
    case 'email.delivery_delayed':
      // No status change; keep 'sent'.
      break
    case 'email.opened':
      update.opened_at = now
      if (lead.status === 'sent') update.status = 'opened'
      break
    case 'email.clicked':
      update.clicked_at = now
      if (lead.status === 'sent' || lead.status === 'opened') update.status = 'clicked'
      break
    case 'email.bounced':
      update.bounced_at = now
      update.status = 'bounced'
      // Add to global suppression so we don't email this address again.
      await supabase
        .from('outreach_suppression')
        .upsert(
          { email: lead.email, reason: 'bounced', source_lead_id: lead.id },
          { onConflict: 'email' },
        )
      break
    case 'email.complained':
      update.complained_at = now
      update.status = 'unsubscribed'
      update.unsubscribed_at = now
      await supabase
        .from('outreach_suppression')
        .upsert(
          { email: lead.email, reason: 'complained', source_lead_id: lead.id },
          { onConflict: 'email' },
        )
      break
  }

  if (Object.keys(update).length > 0) {
    const { error: updErr } = await supabase
      .from('outreach_leads')
      .update(update)
      .eq('id', lead.id)
    if (updErr) {
      return new Response(`Update failed: ${updErr.message}`, { status: 500 })
    }
  }

  return new Response(JSON.stringify({ ok: true, applied: event.type }), {
    headers: { 'Content-Type': 'application/json' },
  })
})

// ---------- Svix signature verification ----------
//
// Spec: https://docs.svix.com/receiving/verifying-payloads/how-manual
//   signed_payload = "<svix_id>.<svix_timestamp>.<body>"
//   signature      = base64( hmac_sha256( signed_payload, secret_bytes ) )
// The secret is sent prefixed with "whsec_" — strip that and base64-decode.

async function verifySvixSignature(
  secret: string,
  id: string,
  ts: string,
  body: string,
  headerSignature: string,
): Promise<boolean> {
  const secretClean = secret.startsWith('whsec_') ? secret.slice('whsec_'.length) : secret
  let secretBytes: Uint8Array
  try {
    secretBytes = base64Decode(secretClean)
  } catch {
    return false
  }

  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    secretBytes,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signed = enc.encode(`${id}.${ts}.${body}`)
  const sig = await crypto.subtle.sign('HMAC', key, signed)
  const expected = base64Encode(new Uint8Array(sig))

  // Header format: "v1,<sig> v1,<sig> ..."  (any one matching is OK)
  const parts = headerSignature.split(' ')
  for (const p of parts) {
    const [version, value] = p.split(',')
    if (version === 'v1' && timingSafeEqual(value, expected)) return true
  }
  return false
}

function base64Decode(s: string): Uint8Array {
  const bin = atob(s)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

function base64Encode(bytes: Uint8Array): string {
  let s = ''
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i])
  return btoa(s)
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}
