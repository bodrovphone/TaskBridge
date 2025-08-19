import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { LOCALE_COOKIE, SUPPORTED_LOCALES } from '@/lib/constants/locales'
import { detectUserLocale } from '@/lib/utils/locale-detection'
import { pathnameHasLocale, addLocaleToPathname } from '@/lib/utils/url-locale'

/**
 * Patterns for routes that should skip middleware processing
 */
const SKIP_MIDDLEWARE_PATTERNS = [
  /^\/_next/, // Next.js internal files
  /^\/api/,   // API routes
  /\./,       // Files with extensions
  /^\/favicon\.ico$/ // Favicon
] as const

/**
 * Checks if the request should skip middleware processing
 * @param pathname - Request pathname
 * @returns True if middleware should be skipped
 */
function shouldSkipMiddleware(pathname: string): boolean {
  return SKIP_MIDDLEWARE_PATTERNS.some(pattern => pattern.test(pathname))
}

/**
 * Main middleware function for locale detection and redirection
 * Optimized for minimal execution cost on returning users
 * @param request - Next.js request object
 * @returns Next.js response or redirect
 */
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // ✅ EARLY RETURN #1: Already has locale in URL - minimal cost for returning users!
  if (pathnameHasLocale(pathname)) {
    return NextResponse.next() // No processing needed
  }

  // ✅ EARLY RETURN #2: Static assets and API routes
  if (shouldSkipMiddleware(pathname)) {
    return NextResponse.next() // Skip static files entirely
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
  // Only run middleware on routes that need locale detection
  matcher: [
    // Skip all internal paths (_next, api) and files with extensions
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ]
}