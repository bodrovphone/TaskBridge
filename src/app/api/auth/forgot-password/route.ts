import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, redirectUrl } = await request.json()

    // Validation
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    if (!redirectUrl) {
      return NextResponse.json(
        { error: 'Redirect URL is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    console.log('[Auth] Sending password reset email to:', email)
    console.log('[Auth] Reset redirect URL:', redirectUrl)

    // Construct callback URL with 'next' parameter
    // This goes through /auth/callback which handles PKCE flow
    const callbackUrl = `${new URL(redirectUrl).origin}/auth/callback?next=${encodeURIComponent(redirectUrl)}`

    console.log('[Auth] Callback URL:', callbackUrl)

    // Send password reset email
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: callbackUrl,
    })

    if (error) {
      console.error('[Auth] Password reset error:', error)
      return NextResponse.json(
        { error: 'Failed to send reset email. Please try again.' },
        { status: 500 }
      )
    }

    console.log('[Auth] Password reset email sent successfully')

    return NextResponse.json({
      success: true,
      message: 'Password reset email sent',
    })
  } catch (error) {
    console.error('[Auth] Password reset exception:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
