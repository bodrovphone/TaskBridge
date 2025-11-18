import { NextResponse } from 'next/server'
import { verifyEmailVerificationToken } from '@/lib/auth/email-verification'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.redirect(
        new URL('/en?error=missing_token', process.env.NEXT_PUBLIC_SITE_URL!)
      )
    }

    // Verify the token
    const payload = await verifyEmailVerificationToken(token)

    if (!payload) {
      console.error('[Auth] Invalid or expired verification token')
      return NextResponse.redirect(
        new URL('/en?error=invalid_token', process.env.NEXT_PUBLIC_SITE_URL!)
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
        new URL('/en?error=verification_failed', process.env.NEXT_PUBLIC_SITE_URL!)
      )
    }

    console.log('[Auth] Email verified successfully for:', {
      userId,
      email,
    })

    // Redirect to app with success message
    return NextResponse.redirect(
      new URL('/en?verified=true', process.env.NEXT_PUBLIC_SITE_URL!)
    )
  } catch (error) {
    console.error('[Auth] Email verification exception:', error)
    return NextResponse.redirect(
      new URL('/en?error=server_error', process.env.NEXT_PUBLIC_SITE_URL!)
    )
  }
}
