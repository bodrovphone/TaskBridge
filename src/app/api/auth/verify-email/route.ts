import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'
import { verifyEmailVerificationToken } from '@/lib/auth/email-verification'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  // Detect locale from cookie (most reliable) or default to 'bg'
  const localeCookie = request.cookies.get('NEXT_LOCALE')?.value
  const locale = localeCookie && ['en', 'bg', 'ru', 'ua'].includes(localeCookie)
    ? localeCookie
    : 'bg'

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!

  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.redirect(
        new URL(`/${locale}?error=missing_token`, baseUrl)
      )
    }

    // Verify the token
    const payload = await verifyEmailVerificationToken(token)

    if (!payload) {
      console.error('[Auth] Invalid or expired verification token')
      return NextResponse.redirect(
        new URL(`/${locale}?error=invalid_token`, baseUrl)
      )
    }

    const { email, userId } = payload

    // Update user's is_email_verified field in users table
    const supabase = await createClient()

    const { error: updateError } = await supabase
      .from('users')
      .update({ is_email_verified: true })
      .eq('id', userId)

    if (updateError) {
      console.error('[Auth] Failed to update email verification status:', updateError)
      return NextResponse.redirect(
        new URL(`/${locale}?error=verification_failed`, baseUrl)
      )
    }

    console.log('[Auth] Email verified successfully for:', {
      userId,
      email,
    })

    // Redirect to email verified success page
    return NextResponse.redirect(
      new URL(`/${locale}/auth/email-verified`, baseUrl)
    )
  } catch (error) {
    console.error('[Auth] Email verification exception:', error)
    return NextResponse.redirect(
      new URL(`/${locale}?error=server_error`, baseUrl)
    )
  }
}
