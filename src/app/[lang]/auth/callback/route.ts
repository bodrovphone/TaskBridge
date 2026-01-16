import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'

/**
 * Redirect localized callback URLs to the main callback handler
 * e.g., /bg/auth/callback → /auth/callback
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url)

  // Preserve all query parameters
  const searchParams = url.searchParams.toString()
  const redirectUrl = `/auth/callback${searchParams ? `?${searchParams}` : ''}`

  return NextResponse.redirect(new URL(redirectUrl, url.origin))
}
