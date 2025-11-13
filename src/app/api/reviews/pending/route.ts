import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/reviews/pending
 * Fetch all completed tasks where customer hasn't left a review yet
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get completed tasks where:
    // 1. User is the customer
    // 2. Task is completed
    // 3. Has an accepted application
    // 4. Customer hasn't reviewed yet (reviewed_by_customer = false)
    const { data: tasks, error } = await supabase
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
      .limit(20)

    if (error) {
      console.error('Error fetching pending reviews:', error)
      return NextResponse.json(
        { error: 'Failed to fetch pending reviews' },
        { status: 500 }
      )
    }

    // Transform to expected format
    const pendingReviews = (tasks || []).map(task => {
      // Get the accepted application (should only be one)
      const acceptedApp = (task.applications as any[])[0]
      const professional = acceptedApp?.professional

      return {
        id: task.id,
        title: task.title,
        professionalId: acceptedApp?.professional_id,
        professionalName: professional?.full_name || 'Unknown',
        professionalAvatar: professional?.avatar_url,
        completedAt: task.completed_at,
        daysAgo: Math.floor(
          (Date.now() - new Date(task.completed_at).getTime()) / (1000 * 60 * 60 * 24)
        )
      }
    })

    return NextResponse.json({
      pendingReviews,
      count: pendingReviews.length
    })
  } catch (error) {
    console.error('Error in pending reviews endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
