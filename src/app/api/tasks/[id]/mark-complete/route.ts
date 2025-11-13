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
 * Allows either professional or customer to mark a task as completed.
 * This triggers a status change to 'completed' and sends notifications
 * to the other party (in-app + Telegram if connected).
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

    // Authorization: User must be either the customer or assigned professional
    const isCustomer = task.customer_id === user.id
    const isProfessional = task.selected_professional_id === user.id

    if (!isCustomer && !isProfessional) {
      return NextResponse.json(
        { error: 'Only the customer or assigned professional can mark this task as complete' },
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
      .select('id, full_name, telegram_id')
      .eq('id', user.id)
      .single()

    const { data: customer } = await adminClient
      .from('users')
      .select('id, full_name, telegram_id')
      .eq('id', task.customer_id)
      .single()

    // Update task status to completed
    const now = new Date().toISOString()
    const { data: updatedTask, error: updateError } = await adminClient
      .from('tasks')
      .update({
        status: 'completed',
        completed_at: now,
        completed_by_professional_at: isProfessional ? now : undefined,
        updated_at: now
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

    // Send notification to the other party (customer or professional)
    const recipientId = isProfessional ? task.customer_id : task.selected_professional_id
    const recipientUser = isProfessional ? customer : professional
    const completedByName = isProfessional
      ? professional?.full_name || 'The professional'
      : customer?.full_name || 'The customer'

    const notificationResult = await createNotification({
      userId: recipientId!,
      type: 'task_completed',
      templateData: {
        taskTitle: task.title,
        professionalName: completedByName,
      },
      metadata: {
        taskId: task.id,
        completedBy: user.id,
        completedAt: now,
        completionNotes,
        completionPhotos,
      },
      actionUrl: isProfessional ? '/reviews/pending' : '/tasks/work', // Customer → leave review, Professional → my work
      deliveryChannel: 'both', // Critical: Send both in-app and Telegram
    })

    // Log the completion event
    console.log('[Tasks] Task marked complete:', {
      taskId: task.id,
      taskTitle: task.title,
      completedBy: isProfessional ? 'professional' : 'customer',
      completedById: user.id,
      notificationSent: notificationResult.success,
      notificationChannels: {
        inApp: true,
        telegram: !!recipientUser?.telegram_id,
        email: false // Not yet implemented
      }
    })

    // Log notification delivery details
    if (!notificationResult.success) {
      console.warn('[Tasks] Notification delivery failed:', notificationResult.error)
    }

    return NextResponse.json({
      success: true,
      message: 'Task marked as complete successfully.',
      task: {
        id: updatedTask.id,
        status: updatedTask.status,
        completed_at: updatedTask.completed_at
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
