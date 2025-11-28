import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'
import { createNotification } from '@/lib/services/notification-service'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')
  const origin = requestUrl.origin

  // Detect locale from referer or 'next' parameter or default to 'en'
  let redirectLocale: 'en' | 'bg' | 'ru' = 'en'

  // Try to extract locale from 'next' parameter first
  if (next) {
    const nextLocaleMatch = next.match(/\/(en|bg|ru)\//)
    if (nextLocaleMatch) {
      redirectLocale = nextLocaleMatch[1] as 'en' | 'bg' | 'ru'
    }
  }

  // Fallback to referer
  if (redirectLocale === 'en') {
    const referer = request.headers.get('referer')
    if (referer) {
      const localeMatch = referer.match(/\/(en|bg|ru)\//)
      if (localeMatch) {
        redirectLocale = localeMatch[1] as 'en' | 'bg' | 'ru'
      }
    }
  }

  // Handle Supabase errors (like expired tokens)
  if (error) {
    console.error('[Auth Callback] Supabase error:', error, errorDescription)

    if (error === 'access_denied' && errorDescription?.includes('expired')) {
      // Redirect to forgot password page with error message
      return NextResponse.redirect(`${origin}/${redirectLocale}/forgot-password?error=expired`)
    }

    return NextResponse.redirect(`${origin}/${redirectLocale}?error=${error}`)
  }

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('[Auth Callback] Error exchanging code for session:', error)
      return NextResponse.redirect(`${origin}/${redirectLocale}?error=auth_error`)
    }

    // Check if this is a password reset flow (indicated by 'next' parameter)
    if (next && data?.user) {
      console.log('[Auth Callback] Password reset flow detected, redirecting to:', next)
      // 'next' is already a full URL, use it directly
      return NextResponse.redirect(next)
    }

    // Check if this is a new user (account just created)
    if (data?.user) {
      // Check if user was created within the last 60 seconds (new signup)
      const createdAt = new Date(data.user.created_at)
      const now = new Date()
      const secondsSinceCreation = (now.getTime() - createdAt.getTime()) / 1000
      const isNewUser = secondsSinceCreation < 60

      // Send welcome notification only for genuinely new users
      if (isNewUser) {
        await createNotification({
          userId: data.user.id,
          type: 'welcome_message',
          templateData: {
            userName: data.user.user_metadata?.full_name || 'there',
          },
          actionUrl: '/browse-tasks',
          deliveryChannel: 'in_app', // In-app only - no Telegram needed for welcome
          locale: redirectLocale, // Use detected locale for notification
        })
      }
    }
  }

  // Redirect to home page with detected locale
  return NextResponse.redirect(`${origin}/${redirectLocale}`)
}
