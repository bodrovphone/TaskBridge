import type { Metadata } from 'next'
import { jwtVerify } from 'jose'
import { createClient } from '@supabase/supabase-js'
import { SUPPORTED_LOCALES, type SupportedLocale } from '@/lib/constants/locales'

export const dynamic = 'force-dynamic'  // token in query string — never cache

interface PageProps {
  params: Promise<{ lang: string }>
  searchParams: Promise<{ token?: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params
  const titles: Record<string, string> = {
    bg: 'Отписване | Trudify',
    en: 'Unsubscribe | Trudify',
    ru: 'Отписка | Trudify',
    ua: 'Відписка | Trudify',
  }
  return {
    title: titles[lang] ?? titles.bg,
    robots: { index: false, follow: false },
  }
}

interface Copy {
  successHeading: string
  successBody: string
  failureHeading: string
  failureBody: string
  backHome: string
}

const COPY: Record<SupportedLocale, Copy> = {
  bg: {
    successHeading: 'Отписани сте',
    successBody: 'Няма да получавате повече имейли от Trudify за тази тема. Извиняваме се за безпокойството.',
    failureHeading: 'Невалидна препратка',
    failureBody: 'Препратката за отписване е невалидна или повредена. Свържете се с нас на support@trudify.com и ще ви отпишем ръчно.',
    backHome: 'Към trudify.com',
  },
  en: {
    successHeading: 'You\'re unsubscribed',
    successBody: 'You won\'t receive any more emails from Trudify on this topic. Sorry for the interruption.',
    failureHeading: 'Invalid link',
    failureBody: 'This unsubscribe link is invalid or corrupted. Please email support@trudify.com and we\'ll unsubscribe you manually.',
    backHome: 'Back to trudify.com',
  },
  ru: {
    successHeading: 'Вы отписаны',
    successBody: 'Вы больше не будете получать письма от Trudify по этой теме. Приносим извинения за беспокойство.',
    failureHeading: 'Недействительная ссылка',
    failureBody: 'Эта ссылка для отписки недействительна или повреждена. Напишите нам на support@trudify.com — отпишем вручную.',
    backHome: 'На trudify.com',
  },
  ua: {
    successHeading: 'Ви відписані',
    successBody: 'Ви більше не отримуватимете листи від Trudify за цією темою. Перепрошуємо за турботу.',
    failureHeading: 'Недійсне посилання',
    failureBody: 'Це посилання для відписки недійсне або пошкоджене. Напишіть нам на support@trudify.com — відпишемо вручну.',
    backHome: 'На trudify.com',
  },
}

interface VerifyResult {
  ok: boolean
  email?: string
  campaignId?: string
}

async function verifyToken(token: string): Promise<VerifyResult> {
  const secret = process.env.OUTREACH_UNSUBSCRIBE_SECRET
  if (!secret) return { ok: false }
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), {
      issuer: 'trudify-outreach',
      audience: 'trudify-unsubscribe',
    })
    if (typeof payload.email !== 'string' || typeof payload.campaignId !== 'string') {
      return { ok: false }
    }
    return { ok: true, email: payload.email, campaignId: payload.campaignId }
  } catch {
    return { ok: false }
  }
}

async function applyUnsubscribe(email: string, campaignId: string): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return false

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const lower = email.toLowerCase()

  // 1. Add to global suppression (idempotent — primary key is email)
  await supabase
    .from('outreach_suppression')
    .upsert(
      { email: lower, reason: 'unsubscribed' },
      { onConflict: 'email', ignoreDuplicates: false },
    )

  // 2. Mark every matching lead as unsubscribed (any campaign, not just this one)
  const now = new Date().toISOString()
  await supabase
    .from('outreach_leads')
    .update({ status: 'unsubscribed', unsubscribed_at: now })
    .eq('email', lower)
    .neq('status', 'unsubscribed')
    .neq('status', 'converted')

  // 3. Use campaignId to silence type warning + log if you want analytics
  void campaignId
  return true
}

function pickLocale(raw: string): SupportedLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(raw) ? (raw as SupportedLocale) : 'bg'
}

export default async function UnsubscribePage({ params, searchParams }: PageProps) {
  const { lang: rawLang } = await params
  const { token } = await searchParams
  const lang = pickLocale(rawLang)
  const copy = COPY[lang]

  let success = false
  if (token) {
    const result = await verifyToken(token)
    if (result.ok && result.email && result.campaignId) {
      success = await applyUnsubscribe(result.email, result.campaignId)
    }
  }

  return (
    <main style={{ maxWidth: 560, margin: '64px auto', padding: '0 24px', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#222' }}>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>
        {success ? copy.successHeading : copy.failureHeading}
      </h1>
      <p style={{ fontSize: 16, lineHeight: 1.55, marginBottom: 24 }}>
        {success ? copy.successBody : copy.failureBody}
      </p>
      <p>
        <a href={`/${lang}`} style={{ color: '#0066CC' }}>
          {copy.backHome}
        </a>
      </p>
    </main>
  )
}
