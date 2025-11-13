import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/tasks/can-create
 * Check if user can create a new task (enforcement logic)
 *
 * Enforcement Hierarchy:
 * 1. HARD BLOCK (Priority 1): Any tasks in pending_customer_confirmation status
 * 2. SOFT BLOCK (Priority 2): 3-task grace period for missing reviews
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // PRIORITY 1: Check for pending confirmations (HARD BLOCK)
    const { data: pendingConfirmations } = await supabase
      .from('tasks')
      .select(`
        id,
        title,
        completed_by_professional_at,
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
      .eq('status', 'pending_customer_confirmation')
      .eq('applications.status', 'accepted')

    if (pendingConfirmations && pendingConfirmations.length > 0) {
      return NextResponse.json({
        canCreate: false,
        blockType: 'pending_confirmation',
        pendingConfirmations: pendingConfirmations.map(task => {
          const acceptedApp = (task.applications as any[])[0]
          return {
            taskId: task.id,
            taskTitle: task.title,
            professionalName: acceptedApp?.professional?.full_name || 'Unknown',
            professionalId: acceptedApp?.professional_id,
            completedAt: task.completed_by_professional_at
          }
        }),
        pendingReviews: [],
        gracePeriodUsed: 0,
        unreviewedCount: 0
      })
    }

    // PRIORITY 2: Check for missing reviews (SOFT BLOCK with grace period)
    // Get user's grace period counter
    const { data: userData } = await supabase
      .from('users')
      .select('tasks_created_since_last_review')
      .eq('id', user.id)
      .single()

    const gracePeriodUsed = userData?.tasks_created_since_last_review || 0

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

    const unreviewedCount = unreviewedTasks?.length || 0

    // Enforce after 3 tasks created without review
    if (unreviewedCount > 0 && gracePeriodUsed >= 3) {
      return NextResponse.json({
        canCreate: false,
        blockType: 'missing_reviews',
        pendingConfirmations: [],
        pendingReviews: (unreviewedTasks || []).map(task => {
          const acceptedApp = (task.applications as any[])[0]
          return {
            taskId: task.id,
            taskTitle: task.title,
            professionalName: acceptedApp?.professional?.full_name || 'Unknown',
            professionalId: acceptedApp?.professional_id,
            completedAt: task.completed_at
          }
        }),
        gracePeriodUsed,
        unreviewedCount
      })
    }

    // Allow task creation
    return NextResponse.json({
      canCreate: true,
      blockType: null,
      pendingConfirmations: [],
      pendingReviews: [],
      gracePeriodUsed,
      unreviewedCount
    })
  } catch (error) {
    console.error('Error checking task creation eligibility:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
