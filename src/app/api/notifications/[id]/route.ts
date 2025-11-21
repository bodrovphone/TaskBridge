/**
 * PATCH /api/notifications/[id]
 *
 * Dismiss or undismiss a single notification
 *
 * Body:
 * - action: 'dismiss' | 'undismiss'
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { authenticateRequest } from '@/lib/auth/api-auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Parse request body
    const body = await request.json()
    const { action } = body

    // Validate action
    if (!['dismiss', 'undismiss'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "dismiss" or "undismiss"' },
        { status: 400 }
      )
    }

    // Update notification state
    const { data: notification, error: updateError } = await supabase
      .from('notifications')
      .update({
        state: action === 'dismiss' ? 'dismissed' : 'sent',
        dismissed_at: action === 'dismiss' ? new Date().toISOString() : null,
      })
      .eq('id', params.id)
      .eq('user_id', user.id) // Security: only update own notifications
      .select()
      .single()

    if (updateError) {
      console.error('Error updating notification:', updateError)
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      notification,
    })

  } catch (error) {
    console.error('Notification update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
