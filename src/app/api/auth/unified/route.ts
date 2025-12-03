import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { generateEmailVerificationToken } from '@/lib/auth/email-verification'
import { getEmailVerificationContent, getLocaleFromRequest } from '@/lib/email/verification-templates'

/**
 * =============================================================================
 * UNIFIED AUTH API - Smart Login/Register Detection
 * =============================================================================
 *
 * This endpoint merges login and registration into a single smart flow:
 *
 * FLOW DIAGRAM:
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  User submits: email + password + (optional) fullName                   │
 * └─────────────────────────────────────────────────────────────────────────┘
 *                                    │
 *                                    ▼
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  Step 1: Try to sign in with email + password                           │
 * └─────────────────────────────────────────────────────────────────────────┘
 *                    │                              │
 *            SUCCESS │                              │ FAILURE
 *                    ▼                              ▼
 *    ┌──────────────────────┐      ┌────────────────────────────────────────┐
 *    │ User exists & pwd OK │      │ Step 2: Check WHY it failed            │
 *    │ → Return LOGIN       │      │ (wrong password OR user doesn't exist) │
 *    └──────────────────────┘      └────────────────────────────────────────┘
 *                                                   │
 *                                                   ▼
 *                              ┌─────────────────────────────────────────────┐
 *                              │ Step 3: Try dummy signUp to check if email  │
 *                              │ is already registered                       │
 *                              └─────────────────────────────────────────────┘
 *                                       │                    │
 *                            "already   │                    │ No error
 *                            registered"│                    │ (email is new)
 *                                       ▼                    ▼
 *                    ┌──────────────────────┐   ┌────────────────────────────┐
 *                    │ User exists, wrong   │   │ Step 4: Check if fullName  │
 *                    │ password             │   │ was provided               │
 *                    │ → Return 401 error   │   └────────────────────────────┘
 *                    └──────────────────────┘            │           │
 *                                                 NO name│           │HAS name
 *                                                        ▼           ▼
 *                                    ┌─────────────────────┐  ┌─────────────┐
 *                                    │ Return 400 error    │  │ CREATE new  │
 *                                    │ with name_required  │  │ account     │
 *                                    │ flag for UI         │  │ → REGISTER  │
 *                                    └─────────────────────┘  └─────────────┘
 *
 * RESPONSE FORMAT:
 * - Success login:    { success: true, action: 'login', user: {...} }
 * - Success register: { success: true, action: 'register', message: '...', user: {...} }
 * - Need name:        { error: '...', name_required: true } (status 400)
 * - Wrong password:   { error: 'Invalid email or password' } (status 401)
 * - Validation error: { error: '...' } (status 400)
 *
 * DEBUG TIPS:
 * - All logs prefixed with [Auth/Unified] for easy filtering
 * - Check Supabase logs for auth.signInWithPassword and auth.signUp errors
 * - The "dummy signup" check may create orphan users in edge cases (rare)
 */
export async function POST(request: Request) {
  try {
    const { email, password, fullName } = await request.json()

    console.log('[Auth/Unified] Request received:', {
      email,
      hasPassword: !!password,
      hasFullName: !!fullName,
      fullNameLength: fullName?.length
    })

    // =========================================================================
    // VALIDATION: Check required fields and format
    // =========================================================================
    if (!email || !password) {
      console.log('[Auth/Unified] Validation failed: missing email or password')
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log('[Auth/Unified] Validation failed: invalid email format:', email)
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      console.log('[Auth/Unified] Validation failed: password too short')
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // =========================================================================
    // STEP 1: Try to sign in - if it works, user exists with correct password
    // =========================================================================
    console.log('[Auth/Unified] Step 1: Attempting sign in for:', email)

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    // LOGIN SUCCESS: User exists and password is correct
    if (signInData?.user) {
      console.log('[Auth/Unified] ✅ LOGIN SUCCESS:', {
        userId: signInData.user.id,
        email: signInData.user.email,
      })

      // Fetch user profile to return complete data
      let userProfile = null
      try {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', signInData.user.id)
          .single()

        userProfile = profile
        console.log('[Auth/Unified] Profile fetched:', { hasProfile: !!profile })
      } catch (err) {
        console.error('[Auth/Unified] Failed to fetch user profile:', err)
      }

      return NextResponse.json({
        success: true,
        action: 'login',
        user: userProfile || {
          id: signInData.user.id,
          email: signInData.user.email,
        },
      })
    }

    // =========================================================================
    // STEP 2 & 3: Sign in failed - determine WHY (wrong pwd vs new user)
    // =========================================================================
    if (signInError) {
      console.log('[Auth/Unified] Step 2: Sign in failed:', signInError.message)

      // Supabase returns "Invalid login credentials" for BOTH:
      // - User exists but wrong password
      // - User doesn't exist at all
      // We need to distinguish these cases to provide correct UX

      // Try a dummy signup to check if email is already registered
      // NOTE: This is a workaround; Supabase doesn't have a "check email exists" API
      console.log('[Auth/Unified] Step 3: Checking if email already registered via dummy signup')

      const { error: checkError } = await supabase.auth.signUp({
        email,
        password: 'dummy_password_for_check_only_12345',
        options: {
          data: { full_name: '' },
        },
      })

      console.log('[Auth/Unified] Dummy signup result:', {
        hasError: !!checkError,
        errorMessage: checkError?.message
      })

      // If we get "already registered" error, user exists but password was wrong
      if (checkError?.message?.includes('already registered') || checkError?.message?.includes('already been registered')) {
        console.log('[Auth/Unified] ❌ WRONG PASSWORD: User exists but provided wrong password:', email)
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        )
      }

      // =========================================================================
      // STEP 4: User doesn't exist - check if we can register them
      // =========================================================================
      console.log('[Auth/Unified] Step 4: Email is new, checking if name provided')

      if (!fullName || fullName.trim() === '') {
        console.log('[Auth/Unified] ⚠️ NAME REQUIRED: New email but no name provided:', email)
        return NextResponse.json(
          {
            error: 'Please provide your name to create an account',
            name_required: true  // UI uses this flag to highlight name field
          },
          { status: 400 }
        )
      }

      // =========================================================================
      // STEP 5: Create new account
      // =========================================================================
      console.log('[Auth/Unified] Step 5: Creating new user:', { email, fullName: fullName.trim() })

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      })

      // Handle signup errors
      if (signUpError) {
        console.error('[Auth/Unified] ❌ SIGNUP ERROR:', signUpError)

        if (signUpError.message.includes('rate limit')) {
          console.log('[Auth/Unified] Rate limited - too many signup attempts')
          return NextResponse.json(
            { error: 'Too many attempts. Please try again in a few minutes.' },
            { status: 429 }
          )
        }

        return NextResponse.json(
          { error: 'Failed to create account. Please try again.' },
          { status: 400 }
        )
      }

      if (!signUpData.user) {
        console.error('[Auth/Unified] ❌ SIGNUP FAILED: No user returned from Supabase')
        return NextResponse.json(
          { error: 'Failed to create account. Please try again.' },
          { status: 500 }
        )
      }

      console.log('[Auth/Unified] ✅ REGISTRATION SUCCESS:', {
        userId: signUpData.user.id,
        email: signUpData.user.email,
        hasSession: !!signUpData.session,
      })

      // =========================================================================
      // STEP 6: Post-registration setup (locale, verification email)
      // =========================================================================

      // Detect and save user's preferred locale for future emails
      const locale = getLocaleFromRequest(request)
      console.log('[Auth/Unified] Step 6a: Saving user locale:', locale)

      try {
        await supabase
          .from('users')
          .update({ preferred_language: locale })
          .eq('id', signUpData.user.id)

        console.log('[Auth/Unified] Locale saved successfully')
      } catch (error) {
        // Non-fatal: user is created, just locale preference not saved
        console.error('[Auth/Unified] Failed to save preferred language (non-fatal):', error)
      }

      // =========================================================================
      // STEP 7: Send verification email via SendGrid
      // =========================================================================
      console.log('[Auth/Unified] Step 7: Sending verification email')
      try {
        const emailContent = getEmailVerificationContent(locale)
        const verificationToken = await generateEmailVerificationToken(email, signUpData.user.id)
        const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/verify-email?token=${verificationToken}`

        console.log('[Auth/Unified] Generated verification URL:', verificationUrl)

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

        if (process.env.SENDGRID_TEMPLATE_ID_EMAIL_VERIFICATION) {
          sendGridPayload.template_id = process.env.SENDGRID_TEMPLATE_ID_EMAIL_VERIFICATION
        } else {
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
        }

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
          console.error('[Auth/Unified] SendGrid API error:', sendGridResponse.status, errorText)
        } else {
          console.log('[Auth/Unified] ✅ Verification email sent successfully to:', email)
        }
      } catch (emailError) {
        // Non-fatal: user is created, just email not sent
        // User can request resend from the app
        console.error('[Auth/Unified] Verification email exception (non-fatal):', emailError)
      }

      // =========================================================================
      // STEP 8: Return success response with user profile
      // =========================================================================
      console.log('[Auth/Unified] Step 8: Fetching profile and returning success')

      let userProfile = null
      try {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', signUpData.user.id)
          .single()

        userProfile = profile
        console.log('[Auth/Unified] Profile fetched for new user:', { hasProfile: !!profile })
      } catch (err) {
        console.error('[Auth/Unified] Failed to fetch new user profile (non-fatal):', err)
      }

      console.log('[Auth/Unified] 🎉 REGISTRATION COMPLETE - returning success')

      return NextResponse.json({
        success: true,
        action: 'register',  // UI uses this to show verification prompt
        message: 'Account created successfully! Please check your email to verify your address.',
        user: userProfile || {
          id: signUpData.user.id,
          email: signUpData.user.email,
        },
      })
    }

    // =========================================================================
    // FALLBACK: Should never reach here, but handle gracefully
    // =========================================================================
    console.error('[Auth/Unified] ❌ UNEXPECTED: Reached fallback - no signInError but also no user')
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  } catch (error) {
    // =========================================================================
    // GLOBAL ERROR HANDLER: Catch any unhandled exceptions
    // =========================================================================
    console.error('[Auth/Unified] ❌ UNHANDLED EXCEPTION:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
