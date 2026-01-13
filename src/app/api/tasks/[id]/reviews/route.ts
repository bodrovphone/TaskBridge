import { createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { calculatePublishedAt } from '@/lib/utils/review-delay'
import { authenticateRequest } from '@/lib/auth/api-auth'

/**
 * POST /api/tasks/[id]/reviews
 * Submit a customer review for a completed task
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await params

    // Authenticate request - supports both Supabase session and notification tokens
    const user = await authenticateRequest(request)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use admin client to bypass RLS when using notification token auth
    const supabase = createAdminClient()

    const body = await request.json()
    const {
      rating,
      comment,
      qualityRating,
      communicationRating,
      timelinessRating,
      professionalismRating,
      isAnonymous,
      delayPublishing
    } = body

    // Validation: Rating is required and must be 1-5
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating is required and must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Get task and verify ownership + status
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select(`
        id,
        customer_id,
        status,
        applications!inner(
          professional_id,
          status
        )
      `)
      .eq('id', taskId)
      .eq('customer_id', user.id)
      .single()

    if (taskError || !task) {
      return NextResponse.json(
        { error: 'Task not found or access denied' },
        { status: 404 }
      )
    }

    // Verify task is completed
    if (task.status !== 'completed') {
      return NextResponse.json(
        { error: 'Task must be completed before reviewing' },
        { status: 400 }
      )
    }

    // Find the accepted application to get professional_id
    const acceptedApp = (task.applications as any[]).find(
      (app: any) => app.status === 'accepted'
    )

    if (!acceptedApp) {
      return NextResponse.json(
        { error: 'No accepted application found for this task' },
        { status: 400 }
      )
    }

    // Check if review already exists
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('task_id', taskId)
      .eq('reviewer_id', user.id)
      .eq('review_type', 'customer_to_professional')
      .maybeSingle()

    if (existingReview) {
      return NextResponse.json(
        { error: 'Review already submitted for this task' },
        { status: 400 }
      )
    }

    // Calculate published_at date
    // - Production: delayed by 1 week
    // - Development/Staging: delayed by 1 day (for testing)
    const publishedAt = calculatePublishedAt(delayPublishing || false)

    // Insert review
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .insert({
        task_id: taskId,
        reviewer_id: user.id,
        reviewee_id: acceptedApp.professional_id,
        rating,
        comment: comment || null,
        review_type: 'customer_to_professional',
        quality_rating: qualityRating || null,
        communication_rating: communicationRating || null,
        timeliness_rating: timelinessRating || null,
        professionalism_rating: professionalismRating || null,
        is_anonymous: isAnonymous || false,
        published_at: publishedAt
      })
      .select()
      .single()

    if (reviewError) {
      console.error('Error creating review:', reviewError)
      return NextResponse.json(
        { error: 'Failed to create review' },
        { status: 500 }
      )
    }

    // Mark task as reviewed by customer
    await supabase
      .from('tasks')
      .update({ reviewed_by_customer: true })
      .eq('id', taskId)

    // Reset grace period counter
    await supabase
      .from('users')
      .update({ tasks_created_since_last_review: 0 })
      .eq('id', user.id)

    // Note: Trigger will auto-update professional's average_rating and total_reviews

    return NextResponse.json({
      success: true,
      review
    })
  } catch (error) {
    console.error('Error in review submission:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
