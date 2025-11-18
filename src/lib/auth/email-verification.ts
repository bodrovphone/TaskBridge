/**
 * Email Verification Token Utilities
 * Generates and verifies JWT tokens for email verification
 */

import { SignJWT, jwtVerify } from 'jose'

const SECRET = new TextEncoder().encode(
  process.env.EMAIL_VERIFICATION_SECRET || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

/**
 * Generate an email verification token
 * Valid for 24 hours
 */
export async function generateEmailVerificationToken(
  email: string,
  userId: string
): Promise<string> {
  const token = await new SignJWT({ email, userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(SECRET)

  return token
}

/**
 * Verify an email verification token
 * Returns the payload if valid, null if invalid/expired
 */
export async function verifyEmailVerificationToken(
  token: string
): Promise<{ email: string; userId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET)

    if (!payload.email || !payload.userId) {
      return null
    }

    return {
      email: payload.email as string,
      userId: payload.userId as string,
    }
  } catch (error) {
    console.error('[Auth] Token verification failed:', error)
    return null
  }
}
