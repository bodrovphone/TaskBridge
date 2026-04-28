/**
 * Resend SDK wrapper.
 *
 * Pure send. Rate limiting is handled by the caller (send.ts sleeps between
 * sends so the human running the batch can watch progress in the terminal).
 */

import { Resend } from 'resend'

let cached: Resend | null = null

function getClient(): Resend {
  if (cached) return cached
  // Outreach uses a key scoped to the outreach subdomain (so transactional
  // notifications can't accidentally piggyback on outreach reputation).
  const key = process.env.RESEND_API_KEY_OUTREACH
  if (!key) throw new Error('RESEND_API_KEY_OUTREACH missing in environment')
  cached = new Resend(key)
  return cached
}

export interface SendArgs {
  to: string
  subject: string
  html: string
  text: string
  replyTo?: string
  unsubscribeUrl: string         // for List-Unsubscribe header (RFC 8058)
}

export interface SendResult {
  id: string
}

export async function sendEmail(args: SendArgs): Promise<SendResult> {
  const from = process.env.RESEND_FROM_EMAIL
  if (!from) throw new Error('RESEND_FROM_EMAIL missing in environment')
  const replyTo = args.replyTo ?? process.env.RESEND_REPLY_TO ?? undefined

  const client = getClient()
  const res = await client.emails.send({
    from,
    to: args.to,
    subject: args.subject,
    html: args.html,
    text: args.text,
    replyTo,
    headers: {
      // Both List-Unsubscribe headers for one-click compliance (Gmail/Yahoo 2024 reqs).
      'List-Unsubscribe': `<${args.unsubscribeUrl}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  })

  if (res.error) {
    throw new Error(`Resend send failed: ${res.error.name}: ${res.error.message}`)
  }
  if (!res.data?.id) {
    throw new Error('Resend returned no message id')
  }
  return { id: res.data.id }
}
