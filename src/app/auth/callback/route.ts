import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'
import { AuthService } from '@/server/application/auth/auth.service'
import { UserRepository } from '@/server/infrastructure/supabase/user.repository'
import { notifyAdminNewUser } from '@/lib/services/admin-notifications'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')
  const origin = requestUrl.origin

  console.log('[Auth Callback] Full URL:', request.url)
  console.log('[Auth Callback] All params:', Object.fromEntries(requestUrl.searchParams.entries()))

  // Detect locale - priority: query param > cookie > 'next' parameter > default 'bg'
  // Cookie is checked early because it's set RIGHT BEFORE OAuth redirect (most reliable)
  let redirectLocale: 'en' | 'bg' | 'ru' | 'ua' = 'bg' // Default to Bulgarian

  // 1. Check for locale query parameter (passed from OAuth redirect URL)
  const localeParam = requestUrl.searchParams.get('locale')
  // 2. Check cookie (set before OAuth redirect - most reliable source)
  const localeCookie = request.cookies.get('NEXT_LOCALE')?.value

  console.log('[Auth Callback] Locale sources:', { localeParam, localeCookie, next })

  if (localeParam && ['en', 'bg', 'ru', 'ua'].includes(localeParam)) {
    redirectLocale = localeParam as 'en' | 'bg' | 'ru' | 'ua'
    console.log('[Auth Callback] Using locale from query param:', redirectLocale)
  }
  // Cookie takes priority over 'next' parameter since it's set right before OAuth
  else if (localeCookie && ['en', 'bg', 'ru', 'ua'].includes(localeCookie)) {
    redirectLocale = localeCookie as 'en' | 'bg' | 'ru' | 'ua'
    console.log('[Auth Callback] Using locale from cookie:', redirectLocale)
  }
  // 3. Try to extract locale from 'next' parameter (password reset flows)
  else if (next) {
    const nextLocaleMatch = next.match(/\/(en|bg|ru|ua)\//)
    if (nextLocaleMatch) {
      redirectLocale = nextLocaleMatch[1] as 'en' | 'bg' | 'ru' | 'ua'
      console.log('[Auth Callback] Using locale from next param:', redirectLocale)
    }
  } else {
    console.log('[Auth Callback] No locale found, using default:', redirectLocale)
  }

  console.log('[Auth Callback] Final redirect locale:', redirectLocale)

  // Read onboarding cookies (set by auth-slide-over before OAuth redirect)
  const registrationIntentCookie = request.cookies.get('trudify_registration_intent')?.value as 'professional' | 'customer' | undefined
  const returnToCookie = request.cookies.get('trudify_return_to')?.value

  console.log('[Auth Callback] Onboarding cookies:', { registrationIntentCookie, returnToCookie })

  // Helper to create redirect response with locale cookie and handle onboarding
  const createRedirectWithLocale = (url: string, showOnboardingDialog = false) => {
    const response = NextResponse.redirect(url)
    response.cookies.set('NEXT_LOCALE', redirectLocale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: 'lax',
    })
    // If professional intent detected, set cookie to trigger client-side dialog
    if (showOnboardingDialog) {
      response.cookies.set('trudify_show_onboarding_dialog', 'true', {
        path: '/',
        maxAge: 60, // Short-lived - just needs to survive the redirect
        sameSite: 'lax',
      })
    }
    // Clear onboarding cookies after use
    if (registrationIntentCookie) {
      response.cookies.delete('trudify_registration_intent')
    }
    if (returnToCookie) {
      response.cookies.delete('trudify_return_to')
    }
    return response
  }

  // Handle Supabase errors (like expired tokens)
  if (error) {
    console.error('[Auth Callback] Supabase error:', error, errorDescription)

    if (error === 'access_denied' && errorDescription?.includes('expired')) {
      // Redirect to forgot password page with error message
      return createRedirectWithLocale(`${origin}/${redirectLocale}/forgot-password?error=expired`)
    }

    return createRedirectWithLocale(`${origin}/${redirectLocale}?error=${error}`)
  }

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('[Auth Callback] Error exchanging code for session:', error)
      return createRedirectWithLocale(`${origin}/${redirectLocale}?error=auth_error`)
    }

    // Create or sync user profile for OAuth users FIRST (before redirect)
    // This is CRITICAL - without this, the user won't have a profile in the users table
    if (data?.user) {
      try {
        const userRepository = new UserRepository()
        const authService = new AuthService(userRepository)

        // Determine if this is an OAuth user (Google/Facebook)
        const provider = data.user.app_metadata?.provider
        const providers = data.user.app_metadata?.providers as string[] | undefined
        const isOAuthUser = provider === 'google' ||
                            provider === 'facebook' ||
                            providers?.includes('google') ||
                            providers?.includes('facebook')

        // Create or sync profile - returns whether user is new
        const result = await authService.createOrSyncUserProfile(
          data.user.id,
          data.user.email!,
          {
            fullName: data.user.user_metadata?.full_name || data.user.user_metadata?.name,
            avatarUrl: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture,
            locale: redirectLocale,
            isOAuthUser, // Auto-verifies email for OAuth users
          }
        )

        try {
          const { isNewUser } = result.unwrap()
          console.log('[Auth Callback] Profile created/synced for user:', data.user.id, '| New registration:', isNewUser)

          // Save registration intent to DB for new users
          if (isNewUser && registrationIntentCookie) {
            await supabase
              .from('users')
              .update({ registration_intent: registrationIntentCookie })
              .eq('id', data.user.id)
            console.log('[Auth Callback] Saved registration_intent:', registrationIntentCookie)
          }

          // Notify admin of new OAuth registration (non-blocking)
          // Only notify for NEW users, not existing user logins
          if (isNewUser) {
            const authProvider = data.user.app_metadata?.provider || 'oauth'
            notifyAdminNewUser({
              fullName: data.user.user_metadata?.full_name || data.user.user_metadata?.name,
              provider: authProvider,
              intent: registrationIntentCookie || undefined,
            }).catch(() => {})
          }
        } catch (unwrapError) {
          console.error('[Auth Callback] Failed to create/sync profile:', unwrapError)
        }
      } catch (profileError) {
        console.error('[Auth Callback] Error creating/syncing profile:', profileError)
        // Don't fail the auth flow - user can retry profile creation later
      }
    }

    // Handle returnTo cookie FIRST - it's explicitly set by AuthSlideOver
    // (e.g., create-task guest flow sets returnTo to /create-task?restore=true)
    // This must take priority over the generic 'next' param from signInWithOAuth
    if (returnToCookie) {
      const decodedReturnTo = decodeURIComponent(returnToCookie)
      console.log('[Auth Callback] Redirecting to returnTo URL:', decodedReturnTo)
      if (decodedReturnTo.startsWith('/') || decodedReturnTo.startsWith(origin)) {
        // Ensure locale is in the path
        const finalUrl = decodedReturnTo.startsWith('/')
          ? `${origin}/${redirectLocale}${decodedReturnTo.replace(/^\/(en|bg|ru|ua)/, '')}`
          : decodedReturnTo
        return createRedirectWithLocale(finalUrl)
      }
    }

    // Redirect to 'next' URL if provided (OAuth flow or password reset)
    if (next && data?.user) {
      console.log('[Auth Callback] Redirecting to next URL:', next)
      // Decode the URL if it was encoded
      const decodedNext = decodeURIComponent(next)
      // Ensure it's a same-origin URL for security
      if (decodedNext.startsWith(origin) || decodedNext.startsWith('/')) {
        return createRedirectWithLocale(decodedNext)
      }
      console.warn('[Auth Callback] Blocked redirect to external URL:', decodedNext)
    }

    // Handle professional intent - redirect to professional profile page
    // This is used by the /register page for ad campaigns
    if (registrationIntentCookie === 'professional') {
      console.log('[Auth Callback] Professional intent - redirecting to professional profile')
      return createRedirectWithLocale(`${origin}/${redirectLocale}/profile/professional?onboarding=true`)
    }

    // Default: redirect to home
    return createRedirectWithLocale(`${origin}/${redirectLocale}`)
  }

  // Redirect to home page with detected locale
  return createRedirectWithLocale(`${origin}/${redirectLocale}`)
}
