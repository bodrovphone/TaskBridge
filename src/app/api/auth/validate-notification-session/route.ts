import { NextRequest, NextResponse } from 'next/server'
import { validateNotificationAutoLoginToken } from '@/lib/auth/notification-auto-login'
import { createAdminClient } from '@/lib/supabase/server'

/**
 * API endpoint to validate a notification session token and return user session data
 * This is called by the useAuth hook when it detects a notificationSession parameter
 *
 * Flow:
 * 1. Validate the notification session token
 * 2. Get user data from database
 * 3. Generate a Supabase session for the user
 * 4. Return session data (access_token, refresh_token, user)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }

    console.log('🔐 Validating notification session token...')

    // Validate the notification session token
    const tokenData = await validateNotificationAutoLoginToken(token)

    if (!tokenData) {
      console.error('❌ Invalid or expired token')
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    console.log('✅ Token valid for user:', tokenData.userId)

    // Get user data using admin client
    const supabaseAdmin = createAdminClient()

    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', tokenData.userId)
      .single()

    if (userError || !user) {
      console.error('❌ User not found:', userError)
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    console.log('📧 User found:', user.email)

    // Return user data and the original notification token
    // The client will use this token for authenticated API requests
    // API routes will validate this token as an alternative to Supabase auth
    return NextResponse.json({
      success: true,
      user: user,
      notificationToken: token // Return the token to use for API authentication
    })

  } catch (error) {
    console.error('❌ Notification session validation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
