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
