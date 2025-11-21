/**
 * DELETE /api/notifications/dismiss-all
 *
 * Delete all notifications for the authenticated user
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { authenticateRequest } from '@/lib/auth/api-auth'

export async function DELETE(request: NextRequest) {
  try {
    // Authenticate request - supports both Supabase session and notification tokens
    const user = await authenticateRequest(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Use admin client to bypass RLS when using notification token auth
    const supabase = createAdminClient()

    // Delete all notifications for this user
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting all notifications:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'All notifications deleted',
    })

  } catch (error) {
    console.error('Delete all notifications API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
