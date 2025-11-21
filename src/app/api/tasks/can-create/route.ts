import { createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth/api-auth'

/**
 * GET /api/tasks/can-create
 * Check if user can create a new task (enforcement logic)
 *
 * Enforcement Hierarchy:
 * 1. SOFT BLOCK (1-2 pending reviews): Warning, dismissable
 * 2. HARD BLOCK (3+ pending reviews): Cannot create task until reviews submitted
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate request - supports both Supabase session and notification tokens
    const user = await authenticateRequest(request)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use admin client to bypass RLS when using notification token auth
    const supabase = createAdminClient()

    // Get count of unreviewed completed tasks
    const { count: pendingReviewsCount, error: tasksError } = await supabase
      .from('tasks')
      .select('id', { count: 'exact', head: true })
      .eq('customer_id', user.id)
      .eq('status', 'completed')
      .eq('reviewed_by_customer', false)

    if (tasksError) {
      console.error('[can-create] Error fetching tasks count:', tasksError)
    }

    const count = pendingReviewsCount || 0

    // HARD BLOCK: 3+ pending reviews
    if (count >= 3) {
      return NextResponse.json({
        canCreate: false,
        blockType: 'hard_block',
        pendingReviews: Array(count).fill({}), // Empty array with count
        unreviewedCount: count
      })
    }

    // SOFT BLOCK: 1-2 pending reviews (warning)
    if (count >= 1) {
      return NextResponse.json({
        canCreate: true, // Still allowed but warned
        blockType: 'soft_block',
        pendingReviews: Array(count).fill({}), // Empty array with count
        unreviewedCount: count
      })
    }

    // Allow task creation - no pending reviews
    return NextResponse.json({
      canCreate: true,
      blockType: null,
      pendingReviews: [],
      unreviewedCount: 0
    })
  } catch (error) {
    console.error('Error checking task creation eligibility:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
