import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { generateEmailVerificationToken } from '@/lib/auth/email-verification'
import { getEmailVerificationContent, getLocaleFromRequest } from '@/lib/email/verification-templates'
import { notifyAdminNewUser } from '@/lib/services/admin-notifications'
import { sendVerificationEmail } from '@/lib/services/resend-email'

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

    // Send custom verification email via Resend
    // User is logged in and can use app, but needs to verify for email notifications
    try {
      const emailContent = getEmailVerificationContent(locale)
      const verificationToken = await generateEmailVerificationToken(email, data.user.id)
      const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/verify-email?token=${verificationToken}`

      console.log('[Auth] Generated verification URL:', verificationUrl)

      const { error: emailError } = await sendVerificationEmail(email, {
        heading: emailContent.heading,
        greeting: emailContent.greeting,
        userName: fullName || email.split('@')[0],
        message: emailContent.message,
        buttonText: emailContent.button_text,
        verificationLink: verificationUrl,
        linkInstruction: emailContent.link_instruction,
        expiryText: emailContent.expires_in,
        footerText: emailContent.footer_text,
        footerRights: emailContent.footer_rights,
        currentYear: emailContent.current_year,
      })

      if (emailError) {
        console.error('[Auth] Resend API error:', emailError)
      } else {
        console.log('[Auth] Verification email sent successfully via Resend to:', email, 'in', locale)
      }
    } catch (emailError) {
      console.error('[Auth] Verification email exception:', emailError)
      // Don't fail signup if email sending fails - user is already created and logged in
    }

    // Fetch user profile to return complete data
    let userProfile = null
    try {
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single()

      userProfile = profile
    } catch (err) {
      console.error('[Auth] Failed to fetch user profile:', err)
    }

    // Notify admin of new registration (non-blocking)
    notifyAdminNewUser({
      fullName: fullName || undefined,
      provider: 'email',
    }).catch(() => {})

    return NextResponse.json({
      success: true,
      message: 'Account created successfully! Please check your email to verify your address.',
      user: userProfile || {
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
