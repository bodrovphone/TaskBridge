import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'
import { AuthService } from '@/server/application/auth/auth.service'
import { UserRepository } from '@/server/infrastructure/supabase/user.repository'

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

  // Helper to create redirect response with locale cookie
  const createRedirectWithLocale = (url: string) => {
    const response = NextResponse.redirect(url)
    response.cookies.set('NEXT_LOCALE', redirectLocale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: 'lax',
    })
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

        // Create or sync profile
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

        if (result.isError()) {
          console.error('[Auth Callback] Failed to create/sync profile:', result)
        } else {
          console.log('[Auth Callback] Profile created/synced for user:', data.user.id)
        }
      } catch (profileError) {
        console.error('[Auth Callback] Error creating/syncing profile:', profileError)
        // Don't fail the auth flow - user can retry profile creation later
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
  }

  // Redirect to home page with detected locale (cookie is set by helper)
  return createRedirectWithLocale(`${origin}/${redirectLocale}`)
}
