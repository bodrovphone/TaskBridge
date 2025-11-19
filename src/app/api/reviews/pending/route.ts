import { createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth/api-auth'

/**
 * GET /api/reviews/pending
 * Fetch all completed tasks where customer hasn't left a review yet
 * Supports both Supabase session and notification token authentication
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate using either Supabase session or notification token
    const user = await authenticateRequest(request)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use admin client for queries to bypass RLS
    const adminSupabase = createAdminClient()

    // Get completed tasks where:
    // 1. User is the customer
    // 2. Task is completed
    // 3. Has an accepted application
    // 4. Customer hasn't reviewed yet (reviewed_by_customer = false)
    const { data: tasks, error } = await adminSupabase
      .from('tasks')
      .select(`
        id,
        title,
        completed_at,
        applications!inner(
          professional_id,
          status
        )
      `)
      .eq('customer_id', user.id)
      .eq('status', 'completed')
      .eq('reviewed_by_customer', false)
      .eq('applications.status', 'accepted')
      .order('completed_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('[Pending Reviews] Error fetching tasks:', error)
      return NextResponse.json(
        { error: 'Failed to fetch pending reviews' },
        { status: 500 }
      )
    }

    // Get all unique professional IDs
    const professionalIds = [...new Set(
      (tasks || [])
        .flatMap(task => (task.applications as any[]))
        .map(app => app.professional_id)
        .filter(Boolean)
    )]

    // Fetch professional data in bulk
    const { data: professionals, error: profError } = await adminSupabase
      .from('users')
      .select('id, full_name, avatar_url')
      .in('id', professionalIds)

    if (profError) {
      console.error('[Pending Reviews] Error fetching professionals:', profError)
    }

    // Create a lookup map
    const professionalMap = new Map(
      (professionals || []).map(prof => [prof.id, prof])
    )

    // Transform to expected format
    const pendingReviews = (tasks || []).map(task => {
      // Get the accepted application (should only be one)
      const acceptedApp = (task.applications as any[])[0]
      const professional = professionalMap.get(acceptedApp?.professional_id)

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
