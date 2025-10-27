/**
 * Auth Profile API Route
 * Thin wrapper around AuthService
 * Handles profile creation/sync and retrieval
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AuthService } from '@/server/application/auth/auth.service'
import { UserRepository } from '@/server/infrastructure/supabase/user.repository'

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
    // 1. Verify authentication
    const supabase = await createClient()
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Parse request body (optional metadata)
    let body: { fullName?: string; phoneNumber?: string } = {}
    try {
      const text = await request.text()
      if (text) {
        body = JSON.parse(text)
      }
    } catch (e) {
      // Ignore JSON parse errors - body is optional
    }

    // 3. Create service instances
    const userRepository = new UserRepository()
    const authService = new AuthService(userRepository)

    // 4. Execute use case: create or sync profile
    const result = await authService.createOrSyncUserProfile(
      authUser.id,
      authUser.email!,
      {
        fullName: body.fullName || authUser.user_metadata?.full_name,
        phoneNumber: body.phoneNumber || authUser.user_metadata?.phone,
        avatarUrl: authUser.user_metadata?.avatar_url,
      }
    )

    // 5. Return user profile or error
    try {
      const user = result.unwrap()
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
    // 1. Verify authentication
    const supabase = await createClient()
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Create service instances
    const userRepository = new UserRepository()
    const authService = new AuthService(userRepository)

    // 3. Get user profile
    const result = await authService.getUserProfile(authUser.id)

    // 4. Return user profile or error
    try {
      const user = result.unwrap()
      return NextResponse.json(
        {
          user: user.toProfile(),
        },
        { status: 200 }
      )
    } catch (error: any) {
      const statusCode = error.name === 'NotFoundError' ? 404 : 400
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
        },
        { status: statusCode }
      )
    }
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
