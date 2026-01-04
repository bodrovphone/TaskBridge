/**
 * Auth Profile API Route
 * Thin wrapper around AuthService
 * Handles profile creation/sync and retrieval
 */

import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/server/application/auth/auth.service'
import { UserRepository } from '@/server/infrastructure/supabase/user.repository'
import { authenticateRequest } from '@/lib/auth/api-auth'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/auth/profile
 * Create or sync user profile after Supabase authentication
 *
 * Called after:
 * - Successful signup
 * - OAuth login (first time or subsequent)
 *
 * Request body (optional):
 * {
 *   fullName?: string
 *   phoneNumber?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate request - supports both Supabase session and notification tokens
    const authUser = await authenticateRequest(request)

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Parse request body (optional metadata)
    let body: { fullName?: string; phoneNumber?: string; locale?: string } = {}
    try {
      const text = await request.text()
      if (text) {
        body = JSON.parse(text)
      }
    } catch (e) {
      // Ignore JSON parse errors - body is optional
    }

    // 3. Detect user's locale from request
    // Priority: body.locale > referer URL > accept-language header > default 'en'
    let detectedLocale: 'en' | 'bg' | 'ru' = 'en'

    if (body.locale && ['en', 'bg', 'ru'].includes(body.locale)) {
      detectedLocale = body.locale as 'en' | 'bg' | 'ru'
    } else {
      // Try to extract from Referer header (e.g., https://domain.com/bg/signup)
      const referer = request.headers.get('referer')
      if (referer) {
        const localeMatch = referer.match(/\/(en|bg|ru)\//)
        if (localeMatch) {
          detectedLocale = localeMatch[1] as 'en' | 'bg' | 'ru'
        }
      }
    }

    // 4. Check if user authenticated via OAuth (Google/Facebook)
    // OAuth providers verify email, so we should auto-verify for these users
    const supabase = await createClient()
    const { data: { user: supabaseUser } } = await supabase.auth.getUser()

    // Check app_metadata.provider or app_metadata.providers for OAuth
    const provider = supabaseUser?.app_metadata?.provider
    const providers = supabaseUser?.app_metadata?.providers as string[] | undefined
    const isOAuthUser = provider === 'google' ||
                        provider === 'facebook' ||
                        providers?.includes('google') ||
                        providers?.includes('facebook')

    // 5. Create service instances
    const userRepository = new UserRepository()
    const authService = new AuthService(userRepository)

    // 6. Execute use case: create or sync profile
    const result = await authService.createOrSyncUserProfile(
      authUser.id,
      authUser.email!,
      {
        fullName: body.fullName || authUser.user_metadata?.full_name,
        phoneNumber: body.phoneNumber || authUser.user_metadata?.phone,
        avatarUrl: authUser.user_metadata?.avatar_url,
        locale: detectedLocale,
        isOAuthUser, // Pass OAuth flag to auto-verify email
      }
    )

    // 7. Return user profile or error
    try {
      const { user } = result.unwrap()
      return NextResponse.json(
        {
          user: user.toProfile(),
          message: 'Profile synced successfully',
        },
        { status: 200 }
      )
    } catch (error: any) {
      const statusCode = error.name === 'ConflictError' ? 409 : 400
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
        },
        { status: statusCode }
      )
    }
  } catch (error) {
    console.error('Profile sync error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/auth/profile
 * Get current authenticated user's profile
 *
 * Returns full user profile with all fields
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate request - supports both Supabase session and notification tokens
    const authUser = await authenticateRequest(request)

    if (!authUser) {
      console.log('[Profile API] GET: No authenticated user found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if this is an auth-only user (no profile yet)
    // This happens when OAuth callback profile creation failed or is pending
    if ((authUser as any)._authOnly) {
      console.log('[Profile API] GET: Auth user exists but no profile:', authUser.id)
      return NextResponse.json(
        { error: 'Profile not found', code: 'PROFILE_NOT_FOUND' },
        { status: 404 }
      )
    }

    console.log('[Profile API] GET: Authenticated user:', authUser.id)

    // 2. Create service instances
    const userRepository = new UserRepository()
    const authService = new AuthService(userRepository)

    // 3. Get user profile
    const result = await authService.getUserProfile(authUser.id)

    // 4. Return user profile or error
    try {
      const user = result.unwrap()
      console.log('[Profile API] GET: Successfully retrieved profile for user:', authUser.id)
      return NextResponse.json(
        {
          user: user.toProfile(),
        },
        { status: 200 }
      )
    } catch (error: any) {
      const statusCode = error.name === 'NotFoundError' ? 404 : 400
      console.error('[Profile API] GET: Result error:', {
        name: error.name,
        message: error.message,
        code: error.code,
        userId: authUser.id
      })
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
        },
        { status: statusCode }
      )
    }
  } catch (error) {
    console.error('[Profile API] GET: Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
