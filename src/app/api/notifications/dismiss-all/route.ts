/**
 * PATCH /api/notifications/dismiss-all
 *
 * Dismiss all sent (unread) notifications for the authenticated user
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Dismiss all sent (unread) notifications
    const { data, error: updateError } = await supabase
      .from('notifications')
      .update({
        state: 'dismissed',
        dismissed_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .eq('state', 'sent')
      .select()

    if (updateError) {
      console.error('Error dismissing notifications:', updateError)
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      dismissedCount: data?.length || 0,
      message: `Dismissed ${data?.length || 0} notifications`,
    })

  } catch (error) {
    console.error('Dismiss all error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
