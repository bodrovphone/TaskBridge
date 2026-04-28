/**
 * Signed unsubscribe tokens.
 *
 * The token encodes the lead's email + a timestamp + the campaign id. Signed
 * with HS256 using OUTREACH_UNSUBSCRIBE_SECRET. Verified by the unsubscribe
 * page so a recipient can opt out without logging in.
 *
 * Tokens never expire — unsubscribe should always work. The timestamp lets us
 * detect tampering only.
 */

import { SignJWT, jwtVerify } from 'jose'

const ISSUER = 'trudify-outreach'
const AUDIENCE = 'trudify-unsubscribe'

export interface UnsubscribePayload {
  email: string
  campaignId: string
  issuedAt: number
}

function getSecret(): Uint8Array {
  const s = process.env.OUTREACH_UNSUBSCRIBE_SECRET
  if (!s) throw new Error('OUTREACH_UNSUBSCRIBE_SECRET missing in environment')
  if (s.length < 32) {
    throw new Error('OUTREACH_UNSUBSCRIBE_SECRET must be at least 32 chars')
  }
  return new TextEncoder().encode(s)
}

export async function signUnsubscribeToken(
  email: string,
  campaignId: string,
): Promise<string> {
  const secret = getSecret()
  const now = Math.floor(Date.now() / 1000)
  return new SignJWT({ email: email.toLowerCase(), campaignId, issuedAt: now })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt(now)
    .sign(secret)
}

export async function verifyUnsubscribeToken(token: string): Promise<UnsubscribePayload> {
  const secret = getSecret()
  const { payload } = await jwtVerify(token, secret, {
    issuer: ISSUER,
    audience: AUDIENCE,
  })
  if (typeof payload.email !== 'string' || typeof payload.campaignId !== 'string') {
    throw new Error('Invalid token payload')
  }
  return {
    email: payload.email,
    campaignId: payload.campaignId,
    issuedAt: typeof payload.issuedAt === 'number' ? payload.issuedAt : 0,
  }
}

export function buildUnsubscribeUrl(token: string, baseUrl: string, lang: string): string {
  const url = new URL(`/${lang}/unsubscribe`, baseUrl)
  url.searchParams.set('token', token)
  return url.toString()
}
