import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { LOCALE_COOKIE, SUPPORTED_LOCALES } from '@/lib/constants/locales'
import { detectUserLocale } from '@/lib/utils/locale-detection'
import { pathnameHasLocale, addLocaleToPathname } from '@/lib/utils/url-locale'
import { updateSession } from '@/lib/supabase/middleware'

/**
 * Patterns for routes that should skip locale processing (but still get session refresh)
 */
const SKIP_LOCALE_PATTERNS = [
  /^\/_next/, // Next.js internal files
  /^\/api/,   // API routes (need session but not locale)
  /^\/auth/,  // Auth callback routes (OAuth, password reset) - handles locale internally
  /\./,       // Files with extensions
  /^\/favicon\.ico$/ // Favicon
] as const

/**
 * Checks if the request should skip locale processing (but still gets session refresh)
 * @param pathname - Request pathname
 * @returns True if locale processing should be skipped
 */
function shouldSkipLocaleProcessing(pathname: string): boolean {
  return SKIP_LOCALE_PATTERNS.some(pattern => pattern.test(pathname))
}

/**
 * Main middleware function for Supabase auth + locale detection
 * Optimized for minimal execution cost on returning users
 * @param request - Next.js request object
 * @returns Next.js response or redirect
 */
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // First, update Supabase session (required for auth to work on ALL routes)
  let supabaseResponse = await updateSession(request)

  // ✅ EARLY RETURN #1: Already has locale in URL - minimal cost for returning users!
  if (pathnameHasLocale(pathname)) {
    return supabaseResponse // Return with updated session
  }

  // ✅ EARLY RETURN #2: Static assets and API routes (skip locale, but session was already refreshed)
  if (shouldSkipLocaleProcessing(pathname)) {
    return supabaseResponse // Return with updated session
  }

  // 🔍 EXPENSIVE OPERATIONS - Only for new users or root URLs
  try {
    // Detect user's preferred locale with fallback chain
    const localeResult = detectUserLocale(
      request.cookies.get(LOCALE_COOKIE.NAME)?.value,
      request.headers.get('accept-language')
    )

    // Create redirect URL with detected locale
    const url = request.nextUrl.clone()
    url.pathname = addLocaleToPathname(pathname, localeResult.locale)

    const response = NextResponse.redirect(url)

    // IMPORTANT: Add Vary header to prevent Vercel from caching redirect for all users
    // Without this, first user's redirect might be cached and served to all subsequent users
    response.headers.set('Vary', 'Accept-Language, Cookie')

    // Set cookie if this is browser-detected or first visit (not from user's explicit choice)
    if (localeResult.source !== 'cookie') {
      response.cookies.set(LOCALE_COOKIE.NAME, localeResult.locale, {
        maxAge: LOCALE_COOKIE.MAX_AGE,
        httpOnly: false, // Allow client-side access for language switcher
        sameSite: LOCALE_COOKIE.SAME_SITE,
        path: LOCALE_COOKIE.PATH
      })
    }

    return response
  } catch (error) {
    // Fallback to default behavior on any error
    console.error('Middleware error:', error)
    return NextResponse.next()
  }
}

export const config = {
  // Run middleware on routes that need auth session refresh + locale detection
  matcher: [
    // Skip all internal paths (_next) and files with extensions
    // Keep /api and /auth to handle Supabase auth callbacks
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ]
}