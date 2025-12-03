import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { generateEmailVerificationToken } from '@/lib/auth/email-verification'
import { getEmailVerificationContent, getLocaleFromRequest } from '@/lib/email/verification-templates'
import { AuthService } from '@/server/application/auth/auth.service'
import { UserRepository } from '@/server/infrastructure/supabase/user.repository'
import type { SupabaseClient } from '@supabase/supabase-js'

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Handle successful login - fetch profile and return response
 */
async function handleSuccessfulLogin(supabase: SupabaseClient, signInData: { user: any }) {
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

/**
 * Handle successful registration - create profile, setup locale, send verification email
 *
 * IMPORTANT: We must call createOrSyncUserProfile to properly set the user's name.
 * The database trigger that creates users on auth.users insert doesn't have access
 * to the full_name from user_metadata, so we need to update it here.
 */
async function handleSuccessfulRegistration(
  supabase: SupabaseClient,
  signUpData: { user: any; session: any },
  email: string,
  fullName: string,
  request: Request
) {
  const locale = getLocaleFromRequest(request)
  console.log('[Auth/Unified] Creating/syncing profile with name:', fullName, 'locale:', locale)

  // =========================================================================
  // STEP 1: Create or sync user profile with the provided name
  // This is CRITICAL - without this, the user's name won't be saved!
  // =========================================================================
  try {
    const userRepository = new UserRepository()
    const authService = new AuthService(userRepository)

    const result = await authService.createOrSyncUserProfile(
      signUpData.user.id,
      email,
      {
        fullName: fullName.trim(),
        locale: locale as 'en' | 'bg' | 'ru',
        isOAuthUser: false, // Email/password signup - email not verified yet
      }
    )

    if (result.isError()) {
      console.error('[Auth/Unified] Failed to create profile:', result)
    } else {
      console.log('[Auth/Unified] ✅ Profile created with name:', fullName)
    }
  } catch (profileError) {
    console.error('[Auth/Unified] Profile creation error (non-fatal):', profileError)
  }

  // =========================================================================
  // STEP 2: Send verification email
  // =========================================================================
  console.log('[Auth/Unified] Sending verification email...')
  try {
    const emailContent = getEmailVerificationContent(locale)
    const verificationToken = await generateEmailVerificationToken(email, signUpData.user.id)
    const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/verify-email?token=${verificationToken}`

    const sendGridPayload: any = {
      personalizations: [{
        to: [{ email }],
        dynamic_template_data: {
          user_name: fullName || email.split('@')[0],
          verification_link: verificationUrl,
          ...emailContent,
        },
      }],
      from: { email: 'noreply@trudify.com', name: 'Trudify' },
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
                <a href="${verificationUrl}" style="background-color: #0066CC; color: white; padding: 14px 40px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
                  ${emailContent.button_text}
                </a>
              </div>
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

    if (sendGridResponse.ok) {
      console.log('[Auth/Unified] ✅ Verification email sent')
    } else {
      console.error('[Auth/Unified] SendGrid error:', await sendGridResponse.text())
    }
  } catch (emailError) {
    console.error('[Auth/Unified] Email sending failed (non-fatal):', emailError)
  }

  // =========================================================================
  // STEP 3: Fetch and return the profile
  // =========================================================================
  let userProfile = null
  try {
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', signUpData.user.id)
      .single()
    userProfile = profile
    console.log('[Auth/Unified] Profile fetched, full_name:', profile?.full_name)
  } catch (err) {
    console.error('[Auth/Unified] Failed to fetch new user profile:', err)
  }

  console.log('[Auth/Unified] 🎉 REGISTRATION COMPLETE')

  return NextResponse.json({
    success: true,
    action: 'register',
    message: 'Account created successfully!',
    user: userProfile || {
      id: signUpData.user.id,
      email: signUpData.user.email,
    },
  })
}

/**
 * =============================================================================
 * UNIFIED AUTH API - Smart Login/Register Detection
 * =============================================================================
 *
 * This endpoint merges login and registration into a single smart flow.
 *
 * FLOW DIAGRAM:
 *
 *                  ┌─────────────────────────────────────┐
 *                  │  User submits: email + password +   │
 *                  │  (optional) fullName                │
 *                  └─────────────────────────────────────┘
 *                                    │
 *                    ┌───────────────┴───────────────┐
 *                    │                               │
 *              HAS NAME                         NO NAME
 *                    │                               │
 *                    ▼                               ▼
 *          ┌─────────────────┐            ┌─────────────────┐
 *          │ Try SIGNUP      │            │ Try SIGNIN      │
 *          │ first           │            │ first           │
 *          └─────────────────┘            └─────────────────┘
 *                    │                               │
 *          ┌────────┴────────┐            ┌────────┴────────┐
 *          │                 │            │                 │
 *       SUCCESS      "already exists"  SUCCESS          FAILURE
 *          │                 │            │                 │
 *          ▼                 ▼            ▼                 ▼
 *    ┌──────────┐    ┌──────────────┐  ┌──────────┐  ┌──────────────┐
 *    │ REGISTER │    │ Try SIGNIN   │  │ LOGIN    │  │ Return       │
 *    │ success  │    │ with pwd     │  │ success  │  │ name_required│
 *    └──────────┘    └──────────────┘  └──────────┘  └──────────────┘
 *                            │
 *                  ┌────────┴────────┐
 *                  │                 │
 *               SUCCESS          FAILURE
 *                  │                 │
 *                  ▼                 ▼
 *            ┌──────────┐    ┌──────────────┐
 *            │ LOGIN    │    │ Wrong        │
 *            │ success  │    │ password     │
 *            └──────────┘    └──────────────┘
 *
 * KEY INSIGHT: We don't do "dummy signups" to check email existence.
 * Instead:
 * - If user provides name → try signup first (natural for new users)
 * - If no name → try signin first (natural for returning users)
 * - This avoids accidentally creating users during existence checks
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
 * - Check browser Network tab for request/response details
 * - Check Supabase Dashboard → Authentication → Logs for auth errors
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
    // STEP 1: Try to sign up first (if name provided) OR sign in (if no name)
    // =========================================================================
    // Strategy: We try signup first if user provided a name. This avoids the
    // "dummy signup" bug where checking email existence would create a user.
    //
    // If no name provided, we try signin first (assuming returning user).
    // =========================================================================

    if (fullName && fullName.trim() !== '') {
      // User provided a name - likely trying to register
      console.log('[Auth/Unified] Step 1a: Name provided, attempting signup first:', email)

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      })

      // SIGNUP SUCCESS: New user created
      if (signUpData?.user && !signUpError) {
        console.log('[Auth/Unified] ✅ REGISTRATION SUCCESS:', {
          userId: signUpData.user.id,
          email: signUpData.user.email,
          hasSession: !!signUpData.session,
        })

        // Continue to post-registration setup (locale, email verification)
        return await handleSuccessfulRegistration(supabase, signUpData, email, fullName, request)
      }

      // SIGNUP FAILED: Check if it's because user already exists
      if (signUpError) {
        console.log('[Auth/Unified] Signup failed:', signUpError.message)

        // If "already registered" - try to sign in instead
        if (signUpError.message?.includes('already registered') || signUpError.message?.includes('already been registered')) {
          console.log('[Auth/Unified] Email already registered, attempting sign in...')

          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (signInData?.user) {
            console.log('[Auth/Unified] ✅ LOGIN SUCCESS (user provided name but already existed):', {
              userId: signInData.user.id,
            })
            return await handleSuccessfulLogin(supabase, signInData)
          }

          // Sign in failed - wrong password
          console.log('[Auth/Unified] ❌ WRONG PASSWORD:', signInError?.message)
          return NextResponse.json(
            { error: 'Invalid email or password' },
            { status: 401 }
          )
        }

        // Rate limit or other error
        if (signUpError.message.includes('rate limit')) {
          return NextResponse.json(
            { error: 'Too many attempts. Please try again in a few minutes.' },
            { status: 429 }
          )
        }

        console.error('[Auth/Unified] ❌ SIGNUP ERROR:', signUpError)
        return NextResponse.json(
          { error: 'Failed to create account. Please try again.' },
          { status: 400 }
        )
      }
    }

    // =========================================================================
    // STEP 1b: No name provided - try sign in first (returning user)
    // =========================================================================
    console.log('[Auth/Unified] Step 1b: No name provided, attempting sign in:', email)

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
      return await handleSuccessfulLogin(supabase, signInData)
    }

    // =========================================================================
    // STEP 2: Sign in failed - user needs to provide name to register
    // =========================================================================
    // Since sign in failed and no name was provided, we can't determine if:
    // - Email exists but wrong password, OR
    // - Email is new
    //
    // We simply ask for the name. On next submit with name:
    // - If email exists: signup fails → we try signin → shows "wrong password"
    // - If email is new: signup succeeds → account created
    // =========================================================================
    if (signInError) {
      console.log('[Auth/Unified] Sign in failed, no name provided:', signInError.message)
      console.log('[Auth/Unified] ⚠️ NAME REQUIRED: Prompting user to provide name')

      return NextResponse.json(
        {
          error: 'Please provide your name to create an account',
          name_required: true
        },
        { status: 400 }
      )
    }

    // =========================================================================
    // FALLBACK: Should never reach here
    // =========================================================================
    console.error('[Auth/Unified] ❌ UNEXPECTED: Reached fallback')
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  } catch (error) {
    console.error('[Auth/Unified] ❌ UNHANDLED EXCEPTION:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
