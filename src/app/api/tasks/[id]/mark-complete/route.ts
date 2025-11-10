import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createNotification } from '@/lib/services/notification-service'

interface RouteContext {
  params: Promise<{
    id: string
  }>
}

/**
 * PATCH /api/tasks/[id]/mark-complete
 *
 * Allows professional to mark an in-progress task as completed.
 * This triggers a status change to 'pending_customer_confirmation' and sends
 * notifications to the customer (in-app + Telegram if connected).
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id: taskId } = await context.params

    // Parse request body
    const body = await request.json()
    const { completionNotes, completionPhotos } = body

    // Get authenticated user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Use admin client for database operations
    const adminClient = await createAdminClient()

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

    // Authorization: User must be the assigned professional
    if (task.selected_professional_id !== user.id) {
      return NextResponse.json(
        { error: 'Only the assigned professional can mark this task as complete' },
        { status: 403 }
      )
    }

    // Validation: Task must be in 'in_progress' status
    if (task.status !== 'in_progress') {
      return NextResponse.json(
        { error: 'Task must be in "in_progress" status to be marked complete' },
        { status: 400 }
      )
    }

    // Get professional and customer details for notification
    const { data: professional } = await adminClient
      .from('users')
      .select('id, full_name')
      .eq('id', user.id)
      .single()

    const { data: customer } = await adminClient
      .from('users')
      .select('id, full_name, telegram_id')
      .eq('id', task.customer_id)
      .single()

    // Update task status
    const { data: updatedTask, error: updateError } = await adminClient
      .from('tasks')
      .update({
        status: 'pending_customer_confirmation',
        completed_by_professional_at: new Date().toISOString(),
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

    // Send notification to customer (in-app + Telegram if connected)
    // Note: Email notifications not yet implemented
    const notificationResult = await createNotification({
      userId: task.customer_id,
      type: 'task_completed',
      templateData: {
        taskTitle: task.title,
        professionalName: professional?.full_name || 'The professional',
      },
      metadata: {
        taskId: task.id,
        professionalId: user.id,
        completedAt: new Date().toISOString(),
        completionNotes,
        completionPhotos,
      },
      actionUrl: `/tasks/${task.id}`,
      deliveryChannel: 'both', // Critical: Send both in-app and Telegram
    })

    // Log the completion event
    console.log('[Tasks] Professional marked task complete:', {
      taskId: task.id,
      taskTitle: task.title,
      professionalId: user.id,
      customerId: task.customer_id,
      notificationSent: notificationResult.success,
      notificationChannels: {
        inApp: true,
        telegram: !!customer?.telegram_id,
        email: false // Not yet implemented
      }
    })

    // Log notification delivery details
    if (!notificationResult.success) {
      console.warn('[Tasks] Notification delivery failed:', notificationResult.error)
    }

    return NextResponse.json({
      success: true,
      message: 'Task marked as complete. Waiting for customer confirmation.',
      task: {
        id: updatedTask.id,
        status: updatedTask.status,
        completed_by_professional_at: updatedTask.completed_by_professional_at
      }
    })

  } catch (error) {
    console.error('[Tasks] Error in mark-complete endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
