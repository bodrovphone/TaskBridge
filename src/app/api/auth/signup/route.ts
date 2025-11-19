import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { generateEmailVerificationToken } from '@/lib/auth/email-verification'
import { getEmailVerificationContent, getLocaleFromRequest } from '@/lib/email/verification-templates'

export async function POST(request: Request) {
  try {
    const { email, password, fullName } = await request.json()

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Use regular signUp to create user and establish session
    // With "Confirm email" OFF in Supabase, user is auto-confirmed and gets JWT immediately
    // We'll track email verification separately in users.is_email_verified
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || '',
        },
      },
    })

    if (error) {
      console.error('[Auth] Signup error:', error)

      // User-friendly error messages
      if (error.message.includes('already registered') || error.message.includes('already been registered')) {
        return NextResponse.json(
          { error: 'This email is already registered. Please sign in instead.' },
          { status: 400 }
        )
      }

      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'Too many signup attempts. Please try again in a few minutes.' },
          { status: 429 }
        )
      }

      return NextResponse.json(
        { error: 'Failed to create account. Please try again.' },
        { status: 400 }
      )
    }

    if (!data.user) {
      return NextResponse.json(
        { error: 'Failed to create account. Please try again.' },
        { status: 500 }
      )
    }

    console.log('[Auth] User signed up successfully:', {
      userId: data.user.id,
      email: data.user.email,
      hasSession: !!data.session,
    })

    // Detect and save user's preferred locale
    const locale = getLocaleFromRequest(request)
    console.log('[Auth] Detected user locale:', locale)

    // Update user profile with preferred locale (will be used for all future emails)
    try {
      await supabase
        .from('users')
        .update({ preferred_language: locale })
        .eq('id', data.user.id)

      console.log('[Auth] Saved preferred language:', locale)
    } catch (error) {
      console.error('[Auth] Failed to save preferred language:', error)
      // Continue anyway - we'll still use detected locale for this email
    }

    // Send custom verification email via SendGrid
    // User is logged in and can use app, but needs to verify for email notifications
    try {

      // Get translated email content
      const emailContent = getEmailVerificationContent(locale)

      // Generate custom verification token (valid for 24 hours)
      const verificationToken = await generateEmailVerificationToken(email, data.user.id)
      const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/verify-email?token=${verificationToken}`

      console.log('[Auth] Generated verification URL:', verificationUrl)

      // Prepare SendGrid payload
      const sendGridPayload: any = {
        personalizations: [{
          to: [{ email: email }],
          dynamic_template_data: {
            user_name: fullName || email.split('@')[0],
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
        console.log('[Auth] Using SendGrid dynamic template:', process.env.SENDGRID_TEMPLATE_ID_EMAIL_VERIFICATION)
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
                <p>${emailContent.greeting} ${fullName || email.split('@')[0]},</p>
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
        console.log('[Auth] Using inline HTML template (no SENDGRID_TEMPLATE_ID_EMAIL_VERIFICATION set)')
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
      } else {
        console.log('[Auth] Verification email sent successfully via SendGrid to:', email, 'in', locale)
      }
    } catch (emailError) {
      console.error('[Auth] Verification email exception:', emailError)
      // Don't fail signup if email sending fails - user is already created and logged in
    }

    return NextResponse.json({
      success: true,
      message: 'Account created successfully! Please check your email to verify your address.',
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    })
  } catch (error) {
    console.error('[Auth] Signup exception:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
