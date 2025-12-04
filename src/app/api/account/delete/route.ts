/**
 * Account Deletion API
 * Permanently deletes user account and all associated data
 * GDPR-compliant with review anonymization
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

interface DeleteAccountRequest {
  password?: string // Required for email/password users
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate with session (need to verify password)
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Parse request body
    let body: DeleteAccountRequest = {}
    try {
      body = await request.json()
    } catch {
      // Body is optional for OAuth users
    }

    // 3. Determine auth provider and verify password if needed
    const provider = user.app_metadata?.provider || 'email'
    const isOAuthUser = provider !== 'email'

    // For email/password users, require password verification
    if (!isOAuthUser) {
      if (!body.password) {
        return NextResponse.json(
          { error: 'Password required for account deletion' },
          { status: 400 }
        )
      }

      // Verify password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: body.password,
      })

      if (signInError) {
        return NextResponse.json(
          { error: 'Invalid password' },
          { status: 401 }
        )
      }
    }

    // 4. Run pre-flight check
    const supabaseAdmin = createAdminClient()

    const { data: blockersResult, error: blockersError } = await supabaseAdmin
      .rpc('check_account_deletion_blockers', { p_user_id: user.id })

    if (blockersError) {
      console.error('Preflight check error:', blockersError)
      return NextResponse.json(
        { error: 'Failed to verify deletion eligibility' },
        { status: 500 }
      )
    }

    if (!blockersResult.can_delete) {
      return NextResponse.json({
        error: 'Cannot delete account with active tasks',
        blockers: blockersResult.blockers,
      }, { status: 409 })
    }

    // 5. Get user's avatar URL before deletion (for storage cleanup)
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('avatar_url')
      .eq('id', user.id)
      .single()

    // 6. Execute deletion via database function
    const { data: deletionResult, error: deletionError } = await supabaseAdmin
      .rpc('delete_user_account', {
        p_user_id: user.id,
        p_deletion_method: 'user_request'
      })

    if (deletionError) {
      console.error('Deletion error:', deletionError)
      return NextResponse.json(
        { error: 'Failed to delete account data' },
        { status: 500 }
      )
    }

    // 7. Delete avatar from Supabase Storage if exists
    if (userData?.avatar_url) {
      try {
        // Extract path from URL: https://xxx.supabase.co/storage/v1/object/public/avatars/user-id/filename
        const avatarUrl = userData.avatar_url
        const pathMatch = avatarUrl.match(/\/avatars\/(.+)$/)

        if (pathMatch) {
          const avatarPath = pathMatch[1]
          await supabaseAdmin.storage.from('avatars').remove([avatarPath])
        }
      } catch (storageError) {
        // Log but don't fail - user data is already deleted
        console.error('Failed to delete avatar from storage:', storageError)
      }
    }

    // 8. Delete from Supabase Auth (auth.users)
    const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)

    if (authDeleteError) {
      // Log but don't fail - profile data is already deleted
      console.error('Failed to delete auth user:', authDeleteError)
    }

    // 9. Sign out the user (clear session)
    await supabase.auth.signOut()

    // 10. Return success
    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully',
      summary: deletionResult,
    })
  } catch (error) {
    console.error('POST /api/account/delete error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
