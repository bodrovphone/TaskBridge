/**
 * API Authentication Helper
 * Validates both Supabase sessions and notification tokens
 */

import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateNotificationAutoLoginToken } from './notification-auto-login'
import { createAdminClient } from '@/lib/supabase/server'

export interface AuthenticatedUser {
  id: string
  email: string
  [key: string]: any
}

/**
 * Authenticate API request - supports both Supabase session and notification token
 *
 * @param request - Next.js request object
 * @returns User data if authenticated, null otherwise
 */
export async function authenticateRequest(
  request: NextRequest
): Promise<AuthenticatedUser | null> {
  // First, check for notification token in Authorization header
  const authHeader = request.headers.get('authorization')

  if (authHeader?.startsWith('NotificationToken ')) {
    const token = authHeader.substring('NotificationToken '.length)

    // Validate notification token
    const tokenData = await validateNotificationAutoLoginToken(token)

    if (tokenData) {
      // Get user data from database
      const supabaseAdmin = createAdminClient()
      const { data: user, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', tokenData.userId)
        .single()

      if (!error && user) {
        return user as AuthenticatedUser
      }
    }
  }

  // Fallback to normal Supabase session auth
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  // Get full user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile as AuthenticatedUser
}

/**
 * Require authentication - throws 401 if not authenticated
 *
 * @param request - Next.js request object
 * @returns User data
 * @throws Response with 401 if not authenticated
 */
export async function requireAuth(
  request: NextRequest
): Promise<AuthenticatedUser> {
  const user = await authenticateRequest(request)

  if (!user) {
    throw new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    )
  }

  return user
}
