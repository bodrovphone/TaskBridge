import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';
import { updateSession } from '@/lib/supabase/middleware';

/**
 * Create next-intl middleware for locale routing
 */
const intlMiddleware = createIntlMiddleware(routing);

/**
 * Main middleware function combining Supabase auth + next-intl locale routing
 * @param request - Next.js request object
 * @returns Next.js response with updated session and locale handling
 */
export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';

  // 301 redirect www to non-www for SEO (canonical URL enforcement)
  if (hostname.startsWith('www.')) {
    const newUrl = new URL(request.url);
    newUrl.host = hostname.replace('www.', '');
    return NextResponse.redirect(newUrl, 301);
  }

  const pathname = request.nextUrl.pathname;

  // Skip middleware for static assets and internal paths
  if (
    pathname.startsWith('/_next') ||
    pathname.includes('.') ||
    pathname.startsWith('/api')
  ) {
    // Still update Supabase session for API routes
    if (pathname.startsWith('/api')) {
      return await updateSession(request);
    }
    return NextResponse.next();
  }

  // 301 redirect root "/" to detected locale for SEO
  // next-intl uses 307 (temporary) by default, which causes Google to
  // treat "/" and "/bg" as duplicates and pick "/" as canonical.
  // We detect the locale ourselves (cookie → browser language → bg default)
  // and issue a permanent 301 so Google indexes the localized URL.
  if (pathname === '/') {
    const cookieLocale = request.cookies.get('preferred-language')?.value;
    const acceptLanguage = request.headers.get('accept-language');
    const { detectUserLocale } = await import('@/lib/utils/locale-detection');
    const { locale } = detectUserLocale(cookieLocale, acceptLanguage);
    const url = new URL(request.url);
    url.pathname = `/${locale}`;
    return NextResponse.redirect(url, 301);
  }

  // Skip intl middleware for auth callback - it has its own locale handling
  // and must not be prefixed with a locale (causes redirect loops)
  if (pathname.startsWith('/auth/callback')) {
    return await updateSession(request);
  }

  // First, update Supabase session (required for auth to work)
  const supabaseResponse = await updateSession(request);

  // Then, handle locale routing with next-intl
  const intlResponse = intlMiddleware(request);

  // Merge headers from both middlewares
  // Copy Supabase session cookies to the intl response
  const response = intlResponse;

  // Copy all cookies from Supabase response to intl response
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    response.cookies.set(cookie.name, cookie.value, {
      ...cookie,
    });
  });

  return response;
}

export const config = {
  // Match all pathnames except for:
  // - API routes (handled separately above for Supabase)
  // - Next.js internals (_next)
  // - Static files (files with extensions)
  matcher: ['/((?!api|trpc|_next|_vercel|.*\\..*).*)', '/'],
};
