import { NextRequest, NextResponse } from 'next/server'
import { getUserNotificationChannel } from '@/lib/services/email-notification'

/**
 * GET /api/users/[id]/notification-channel
 *
 * Check if user has notification channels configured
 * Used by client components to show warning banner
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id

    const result = await getUserNotificationChannel(userId)

    return NextResponse.json({
      channel: result.channel,
      canReceiveNotifications: result.canReceiveNotifications,
      showWarning: !result.canReceiveNotifications,
    })
  } catch (error) {
    console.error('[API] Error checking notification channel:', error)
    return NextResponse.json(
      { error: 'Failed to check notification channel' },
      { status: 500 }
    )
  }
}
