/**
 * GET /api/notifications
 *
 * Fetch notifications for the authenticated user with filtering and pagination
 *
 * Query params:
 * - state: 'sent' | 'dismissed' | 'all' (default: 'all')
 * - type: notification type filter (optional)
 * - limit: number of notifications to return (default: 8, max: 100)
 * - offset: pagination offset (default: 0)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { authenticateRequest } from '@/lib/auth/api-auth'

export async function GET(request: NextRequest) {
  try {
    // Check authentication (supports both Supabase session and notification token)
    const user = await authenticateRequest(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = await createClient()

    // Parse query params
    const { searchParams } = new URL(request.url)
    const state = searchParams.get('state') // 'sent', 'dismissed', or null (all)
    const type = searchParams.get('type') // notification type filter
    const limit = Math.min(parseInt(searchParams.get('limit') || '8'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query - fetch most recent notifications
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

    return NextResponse.json({
      notifications: notifications || [],
      total: count || 0,
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
