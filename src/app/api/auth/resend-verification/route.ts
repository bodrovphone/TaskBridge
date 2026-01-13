import { createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { generateEmailVerificationToken } from '@/lib/auth/email-verification'
import { getEmailVerificationContent, type SupportedLocale } from '@/lib/email/verification-templates'
import { authenticateRequest } from '@/lib/auth/api-auth'

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

    // Generate new verification token and send email via SendGrid
    try {
      // Use user's saved preferred language (fallback to 'bg' if not set)
      const locale = (userData.preferred_language as SupportedLocale) || 'bg'
      console.log('[Auth] Using user preferred language for resend email:', locale)

      // Get translated email content
      const emailContent = getEmailVerificationContent(locale)

      const verificationToken = await generateEmailVerificationToken(user.email!, user.id)
      const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/verify-email?token=${verificationToken}`

      // Prepare SendGrid payload
      const sendGridPayload: any = {
        personalizations: [{
          to: [{ email: user.email }],
          dynamic_template_data: {
            user_name: userData.full_name || user.email!.split('@')[0],
            verification_link: verificationUrl,
            ...emailContent,
          },
        }],
        from: {
          email: 'noreply@trudify.com',
          name: 'Trudify',
        },
      }

      // Use dynamic template if template_id is set, otherwise use inline HTML
      if (process.env.SENDGRID_TEMPLATE_ID_EMAIL_VERIFICATION) {
        sendGridPayload.template_id = process.env.SENDGRID_TEMPLATE_ID_EMAIL_VERIFICATION
      } else {
        // Fallback to inline HTML if no template configured
        sendGridPayload.subject = `${emailContent.button_text} - Trudify`
        sendGridPayload.content = [{
          type: 'text/html',
          value: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background-color: #0066CC; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                <div style="color: white; font-size: 28px; font-weight: bold;">Trudify</div>
              </div>
              <div style="padding: 40px 30px; background-color: white;">
                <h2 style="color: #333; margin-top: 0;">${emailContent.heading}</h2>
                <p>${emailContent.greeting} ${userData.full_name || user.email!.split('@')[0]},</p>
                <p>${emailContent.message}</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${verificationUrl}"
                     style="background-color: #0066CC; color: white; padding: 14px 40px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
                    ${emailContent.button_text}
                  </a>
                </div>
                <p style="color: #666; font-size: 14px; margin-top: 30px;">
                  ${emailContent.link_instruction}<br>
                  <a href="${verificationUrl}">${verificationUrl}</a>
                </p>
              </div>
              <div style="padding: 20px 30px; background-color: #f9f9f9; border-radius: 0 0 8px 8px; text-align: center;">
                <p style="color: #666; font-size: 14px;">${emailContent.footer_text}</p>
                <p style="color: #666; font-size: 14px;">© ${emailContent.current_year} Trudify. ${emailContent.footer_rights}</p>
              </div>
            </div>
          `,
        }]
      }

      // Send email via SendGrid API
      const sendGridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sendGridPayload),
      })

      if (!sendGridResponse.ok) {
        const errorText = await sendGridResponse.text()
        console.error('[Auth] SendGrid API error:', sendGridResponse.status, errorText)
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
