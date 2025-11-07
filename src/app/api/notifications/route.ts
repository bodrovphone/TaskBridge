/**
 * GET /api/notifications
 *
 * Fetch notifications for the authenticated user with filtering and pagination
 *
 * Query params:
 * - state: 'sent' | 'dismissed' | 'all' (default: 'all')
 * - type: notification type filter (optional)
 * - limit: number of notifications to return (default: 50, max: 100)
 * - offset: pagination offset (default: 0)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
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

    // Parse query params
    const { searchParams } = new URL(request.url)
    const state = searchParams.get('state') // 'sent', 'dismissed', or null (all)
    const type = searchParams.get('type') // notification type filter
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query
    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply state filter
    if (state && state !== 'all') {
      query = query.eq('state', state)
    }

    // Apply type filter
    if (type) {
      query = query.eq('type', type)
    }

    const { data: notifications, error, count } = await query

    if (error) {
      console.error('Error fetching notifications:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // Get unread count separately
    const { count: unreadCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('state', 'sent')

    return NextResponse.json({
      notifications: notifications || [],
      total: count || 0,
      unreadCount: unreadCount || 0,
      hasMore: (offset + limit) < (count || 0),
      pagination: {
        limit,
        offset,
        nextOffset: (offset + limit) < (count || 0) ? offset + limit : null,
      },
    })

  } catch (error) {
    console.error('Notifications API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
