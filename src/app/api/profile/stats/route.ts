/**
 * Profile Statistics API Route
 * Returns aggregated statistics for customer and professional profiles
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { authenticateRequest } from '@/lib/auth/api-auth'

export interface CustomerStats {
  tasksPosted: number
  totalApplicationsReceived: number
  reviewsGiven: number
}

export interface ProfessionalStats {
  completedJobs: number
  activeJobs: number
  totalEarnings: number
  reviewsReceived: number
  averageRating: number | null
}

/**
 * GET /api/profile/stats
 * Get customer and professional statistics for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate request
    const authUser = await authenticateRequest(request)

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()

    // Run all queries in parallel for performance
    const [
      customerTasksResult,
      customerReviewsResult,
      professionalApplicationsResult,
      professionalReviewsResult
    ] = await Promise.all([
      // CUSTOMER: Get tasks posted with application counts
      supabase
        .from('tasks')
        .select('id, applications(count)', { count: 'exact' })
        .eq('customer_id', authUser.id),

      // CUSTOMER: Get reviews written by this user
      supabase
        .from('reviews')
        .select('id', { count: 'exact', head: true })
        .eq('reviewer_id', authUser.id)
        .eq('review_type', 'customer_to_professional'),

      // PROFESSIONAL: Get accepted applications with task status and proposed price
      supabase
        .from('applications')
        .select(`
          id,
          proposed_price_bgn,
          tasks!inner(status)
        `)
        .eq('professional_id', authUser.id)
        .eq('status', 'accepted'),

      // PROFESSIONAL: Get reviews received
      supabase
        .from('reviews')
        .select('id, rating')
        .eq('reviewee_id', authUser.id)
        .eq('review_type', 'customer_to_professional')
    ])

    // Calculate CUSTOMER stats
    const tasksPosted = customerTasksResult.data?.length ?? 0
    const totalApplicationsReceived = customerTasksResult.data?.reduce((sum, task) => {
      const appCount = (task.applications as any)?.[0]?.count ?? 0
      return sum + appCount
    }, 0) ?? 0
    const reviewsGiven = customerReviewsResult.count ?? 0

    // Calculate PROFESSIONAL stats
    const acceptedApps = professionalApplicationsResult.data ?? []

    // Count completed and active jobs
    const completedJobs = acceptedApps.filter(
      app => (app.tasks as any)?.status === 'completed'
    ).length

    const activeJobs = acceptedApps.filter(
      app => (app.tasks as any)?.status === 'in_progress'
    ).length

    // Sum earnings from completed jobs only
    const totalEarnings = acceptedApps
      .filter(app => (app.tasks as any)?.status === 'completed')
      .reduce((sum, app) => sum + (app.proposed_price_bgn ?? 0), 0)

    // Calculate reviews and rating
    const reviews = professionalReviewsResult.data ?? []
    const reviewsReceived = reviews.length
    const averageRating = reviewsReceived > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewsReceived
      : null

    const customerStats: CustomerStats = {
      tasksPosted,
      totalApplicationsReceived,
      reviewsGiven
    }

    const professionalStats: ProfessionalStats = {
      completedJobs,
      activeJobs,
      totalEarnings,
      reviewsReceived,
      averageRating
    }

    return NextResponse.json({
      customerStats,
      professionalStats
    })
  } catch (error) {
    console.error('GET /api/profile/stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
