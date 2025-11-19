import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/tasks/can-create
 * Check if user can create a new task (enforcement logic)
 *
 * Enforcement Hierarchy:
 * 1. SOFT BLOCK (1-2 pending reviews): Warning, dismissable
 * 2. HARD BLOCK (3+ pending reviews): Cannot create task until reviews submitted
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get unreviewed completed tasks
    const { data: unreviewedTasks } = await supabase
      .from('tasks')
      .select(`
        id,
        title,
        completed_at,
        applications!inner(
          professional_id,
          status,
          professional:professional_id(
            full_name,
            avatar_url
          )
        )
      `)
      .eq('customer_id', user.id)
      .eq('status', 'completed')
      .eq('reviewed_by_customer', false)
      .eq('applications.status', 'accepted')
      .order('completed_at', { ascending: false })

    const pendingReviewsCount = unreviewedTasks?.length || 0

    const pendingReviewsData = (unreviewedTasks || []).map(task => {
      const acceptedApp = (task.applications as any[])[0]
      return {
        id: task.id,
        title: task.title,
        professionalName: acceptedApp?.professional?.full_name || 'Unknown',
        professionalAvatar: acceptedApp?.professional?.avatar_url,
        professionalId: acceptedApp?.professional_id,
        completedAt: task.completed_at,
        daysAgo: Math.floor((Date.now() - new Date(task.completed_at).getTime()) / (1000 * 60 * 60 * 24))
      }
    })

    // HARD BLOCK: 3+ pending reviews
    if (pendingReviewsCount >= 3) {
      return NextResponse.json({
        canCreate: false,
        blockType: 'hard_block',
        pendingReviews: pendingReviewsData,
        unreviewedCount: pendingReviewsCount
      })
    }

    // SOFT BLOCK: 1-2 pending reviews (warning)
    if (pendingReviewsCount >= 1) {
      return NextResponse.json({
        canCreate: true, // Still allowed but warned
        blockType: 'soft_block',
        pendingReviews: pendingReviewsData,
        unreviewedCount: pendingReviewsCount
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
