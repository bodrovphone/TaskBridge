import { createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { generateEmailVerificationToken } from '@/lib/auth/email-verification'
import { getEmailVerificationContent, type SupportedLocale } from '@/lib/email/verification-templates'
import { authenticateRequest } from '@/lib/auth/api-auth'
import { sendVerificationEmail } from '@/lib/services/resend-email'

// Simple in-memory rate limiting (for MVP - use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(email: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  const maxAttempts = 3 // Max 3 emails
  const windowMs = 60 * 60 * 1000 // Per hour

  const record = rateLimitMap.get(email)

  if (!record || now > record.resetAt) {
    rateLimitMap.set(email, {
      count: 1,
      resetAt: now + windowMs,
    })
    return { allowed: true }
  }

  if (record.count >= maxAttempts) {
    const retryAfterSeconds = Math.ceil((record.resetAt - now) / 1000 / 60) // Minutes
    return { allowed: false, retryAfter: retryAfterSeconds }
  }

  record.count++
  return { allowed: true }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate request - supports both Supabase session and notification tokens
    const user = await authenticateRequest(request)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in first.' }, { status: 401 })
    }

    // Use admin client to bypass RLS when using notification token auth
    const supabase = createAdminClient()

    // Check if email is already verified in our users table and get user's preferred language
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('is_email_verified, full_name, preferred_language')
      .eq('id', user.id)
      .single()

    if (userError) {
      console.error('[Auth] Failed to fetch user data:', userError)
      return NextResponse.json(
        { error: 'Failed to check verification status.' },
        { status: 500 }
      )
    }

    if (userData.is_email_verified) {
      return NextResponse.json(
        { error: 'Your email is already verified!' },
        { status: 400 }
      )
    }

    // Rate limiting check
    const rateLimitCheck = checkRateLimit(user.email!)
    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        {
          error: `Too many verification emails sent. Please try again in ${rateLimitCheck.retryAfter} minutes.`,
        },
        { status: 429 }
      )
    }

    // Generate new verification token and send email via Resend
    try {
      // Use user's saved preferred language (fallback to 'bg' if not set)
      const locale = (userData.preferred_language as SupportedLocale) || 'bg'
      console.log('[Auth] Using user preferred language for resend email:', locale)

      const emailContent = getEmailVerificationContent(locale)
      const verificationToken = await generateEmailVerificationToken(user.email!, user.id)
      const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/verify-email?token=${verificationToken}`

      const { error: resendError } = await sendVerificationEmail(user.email!, {
        heading: emailContent.heading,
        greeting: emailContent.greeting,
        userName: userData.full_name || user.email!.split('@')[0],
        message: emailContent.message,
        buttonText: emailContent.button_text,
        verificationLink: verificationUrl,
        linkInstruction: emailContent.link_instruction,
        expiryText: emailContent.expires_in,
        footerText: emailContent.footer_text,
        footerRights: emailContent.footer_rights,
        currentYear: emailContent.current_year,
      })

      if (resendError) {
        console.error('[Auth] Resend API error:', resendError)
        return NextResponse.json(
          { error: 'Failed to send verification email. Please try again.' },
          { status: 500 }
        )
      }

      console.log('[Auth] Verification email resent:', {
        userId: user.id,
        email: user.email,
        locale,
      })

      return NextResponse.json({
        success: true,
        message: 'Verification email sent! Please check your inbox.',
      })
    } catch (emailError) {
      console.error('[Auth] Email sending exception:', emailError)
      return NextResponse.json(
        { error: 'Failed to send verification email. Please try again.' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('[Auth] Resend verification exception:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
