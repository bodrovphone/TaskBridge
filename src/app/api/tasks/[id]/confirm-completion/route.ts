import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createNotification } from '@/lib/services/notification-service'
import { authenticateRequest } from '@/lib/auth/api-auth'

interface RouteContext {
  params: Promise<{
    id: string
  }>
}

interface ConfirmationData {
  actualPricePaid?: number
  rating?: number
  reviewText?: string
}

interface RejectionData {
  reason: 'not_completed' | 'poor_quality' | 'different_scope' | 'other'
  description?: string
}

interface RequestBody {
  action: 'confirm' | 'reject'
  confirmationData?: ConfirmationData
  rejectionData?: RejectionData
}

/**
 * POST /api/tasks/[id]/confirm-completion
 *
 * Allows customer to confirm or reject task completion after professional marks it as done.
 *
 * - Confirm: Finalizes task, deletes rejected applications, optionally creates review
 * - Reject: Returns task to in_progress, clears completion timestamp
 */
export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id: taskId } = await context.params

    // Parse and validate request body
    const body: RequestBody = await request.json()
    const { action, confirmationData, rejectionData } = body

    // Validate action
    if (!action || (action !== 'confirm' && action !== 'reject')) {
      return NextResponse.json(
        { error: 'Action must be "confirm" or "reject"' },
        { status: 400 }
      )
    }

    // Validate rejection data
    if (action === 'reject' && (!rejectionData || !rejectionData.reason)) {
      return NextResponse.json(
        { error: 'Rejection reason is required when rejecting' },
        { status: 400 }
      )
    }

    // Authenticate request - supports both Supabase session and notification tokens
    const user = await authenticateRequest(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Use admin client to bypass RLS when using notification token auth
    const adminClient = createAdminClient()

    // Fetch task details
    const { data: task, error: taskError } = await adminClient
      .from('tasks')
      .select('id, title, status, customer_id, selected_professional_id')
      .eq('id', taskId)
      .single()

    if (taskError || !task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    // Authorization: User must be the task owner (customer)
    if (task.customer_id !== user.id) {
      return NextResponse.json(
        { error: 'Only the task owner can confirm completion' },
        { status: 403 }
      )
    }

    // Validation: Task must be pending customer confirmation
    if (task.status !== 'pending_customer_confirmation') {
      return NextResponse.json(
        { error: 'Task must be pending customer confirmation' },
        { status: 400 }
      )
    }

    // Get customer and professional details for notifications
    const { data: customer } = await adminClient
      .from('users')
      .select('id, full_name')
      .eq('id', user.id)
      .single()

    const { data: professional } = await adminClient
      .from('users')
      .select('id, full_name, telegram_id')
      .eq('id', task.selected_professional_id)
      .single()

    // Handle CONFIRM path
    if (action === 'confirm') {
      // Update task to completed status
      const { data: updatedTask, error: updateError } = await adminClient
        .from('tasks')
        .update({
          status: 'completed',
          confirmed_by_customer_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          reviewed_by_customer: !!(confirmationData?.rating || confirmationData?.reviewText)
        })
        .eq('id', taskId)
        .select()
        .single()

      if (updateError) {
        console.error('[Tasks] Failed to update task status:', updateError)
        return NextResponse.json(
          { error: 'Failed to update task status' },
          { status: 500 }
        )
      }

      // Delete rejected applications (cleanup)
      const { data: deleteResult, error: deleteError } = await adminClient
        .from('applications')
        .delete()
        .eq('task_id', taskId)
        .eq('status', 'rejected')
        .select()

      // Log deletion (don't fail request if deletion fails)
      if (deleteError) {
        console.warn('[Tasks] Failed to delete rejected applications:', deleteError)
      } else {
        console.log(`[Tasks] Deleted ${deleteResult?.length || 0} rejected applications for task ${taskId}`)
      }

      // Create review if rating or review text provided
      let reviewCreated = false
      if (confirmationData?.rating || confirmationData?.reviewText) {
        const { error: reviewError } = await adminClient
          .from('reviews')
          .insert({
            task_id: taskId,
            reviewer_id: user.id,
            reviewee_id: task.selected_professional_id,
            rating: confirmationData.rating || 5,
            comment: confirmationData.reviewText,
            review_type: 'customer_to_professional'
          })

        if (reviewError) {
          console.warn('[Tasks] Failed to create review:', reviewError)
        } else {
          reviewCreated = true
          console.log(`[Tasks] Review created for task ${taskId}`)
        }
      }

      // Send notification to professional (in-app + Telegram)
      const notificationResult = await createNotification({
        userId: task.selected_professional_id,
        type: 'task_completed',
        templateData: {
          taskTitle: task.title,
          customerName: customer?.full_name || 'The customer',
        },
        metadata: {
          taskId: task.id,
          customerId: user.id,
          completedAt: new Date().toISOString(),
          rating: confirmationData?.rating,
          actualPricePaid: confirmationData?.actualPricePaid,
        },
        actionUrl: `/tasks/${task.id}`,
        deliveryChannel: 'both', // Critical: Telegram + In-app
      })

      // Log the confirmation event
      console.log('[Tasks] Customer confirmed task completion:', {
        taskId: task.id,
        taskTitle: task.title,
        customerId: user.id,
        professionalId: task.selected_professional_id,
        rating: confirmationData?.rating,
        reviewCreated,
        applicationsDeleted: deleteResult?.length || 0,
        notificationSent: notificationResult.success,
        notificationChannels: {
          inApp: true,
          telegram: !!professional?.telegram_id,
        }
      })

      if (!notificationResult.success) {
        console.warn('[Tasks] Notification delivery failed:', notificationResult.error)
      }

      return NextResponse.json({
        success: true,
        message: 'Task completed successfully',
        task: {
          id: updatedTask.id,
          status: updatedTask.status,
          confirmed_by_customer_at: updatedTask.confirmed_by_customer_at,
          completed_at: updatedTask.completed_at
        }
      })
    }

    // Handle REJECT path
    if (action === 'reject') {
      // Update task back to in_progress status
      const { data: updatedTask, error: updateError } = await adminClient
        .from('tasks')
        .update({
          status: 'in_progress',
          completed_by_professional_at: null, // Clear completion timestamp
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .select()
        .single()

      if (updateError) {
        console.error('[Tasks] Failed to update task status:', updateError)
        return NextResponse.json(
          { error: 'Failed to update task status' },
          { status: 500 }
        )
      }

      // Map rejection reasons to readable messages
      const reasonMessages: Record<string, string> = {
        not_completed: 'Work not completed',
        poor_quality: 'Work quality does not meet expectations',
        different_scope: 'Work differs from agreed scope',
        other: 'Other issues',
      }

      const reasonMessage = reasonMessages[rejectionData!.reason] || rejectionData!.reason

      // Send notification to professional with rejection details
      const notificationResult = await createNotification({
        userId: task.selected_professional_id,
        type: 'task_status_changed',
        title: 'Task Completion Rejected',
        message: `The customer has requested changes for "${task.title}". Reason: ${reasonMessage}${rejectionData!.description ? `\n\nDetails: ${rejectionData!.description}` : ''}`,
        metadata: {
          taskId: task.id,
          customerId: user.id,
          rejectionReason: rejectionData!.reason,
          rejectionDescription: rejectionData!.description,
        },
        actionUrl: `/tasks/${task.id}`,
        deliveryChannel: 'both', // Critical: Professional needs immediate notification
      })

      // Log the rejection event
      console.log('[Tasks] Customer rejected task completion:', {
        taskId: task.id,
        taskTitle: task.title,
        customerId: user.id,
        professionalId: task.selected_professional_id,
        rejectionReason: rejectionData!.reason,
        rejectionDescription: rejectionData!.description,
        notificationSent: notificationResult.success,
        notificationChannels: {
          inApp: true,
          telegram: !!professional?.telegram_id,
        }
      })

      if (!notificationResult.success) {
        console.warn('[Tasks] Notification delivery failed:', notificationResult.error)
      }

      return NextResponse.json({
        success: true,
        message: 'Feedback sent to professional',
        task: {
          id: updatedTask.id,
          status: updatedTask.status,
          completed_by_professional_at: updatedTask.completed_by_professional_at
        }
      })
    }

  } catch (error) {
    console.error('[Tasks] Error in confirm-completion endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
