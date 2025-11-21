import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createNotification } from '@/lib/services/notification-service'
import { authenticateRequest } from '@/lib/auth/api-auth'

interface RouteContext {
  params: Promise<{
    id: string
  }>
}

/**
 * DELETE /api/tasks/[id]/cancel
 *
 * Allows task author to cancel their task. This will:
 * - Delete all applications
 * - Delete all task-related messages
 * - Delete all task-related notifications
 * - Update task status to 'cancelled'
 * - Notify all professionals who applied
 */
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id: taskId } = await context.params

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

    // Fetch task details with applications count and images
    const { data: task, error: taskError } = await adminClient
      .from('tasks')
      .select(`
        id,
        title,
        status,
        customer_id,
        selected_professional_id,
        images
      `)
      .eq('id', taskId)
      .single()

    if (taskError || !task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    // Authorization: Only task author can cancel
    if (task.customer_id !== user.id) {
      return NextResponse.json(
        { error: 'Only the task author can cancel this task' },
        { status: 403 }
      )
    }

    // Validation: Can only cancel open tasks (not started yet)
    // For in_progress tasks, customer must either mark complete or remove professional
    if (task.status !== 'open') {
      return NextResponse.json(
        { error: 'Only open tasks can be cancelled. For in-progress tasks, please mark as complete or remove the professional.' },
        { status: 400 }
      )
    }

    // Get all professionals who applied (for notifications)
    const { data: applications, error: applicationsError } = await adminClient
      .from('applications')
      .select('professional_id, users!inner(id, full_name, telegram_id)')
      .eq('task_id', taskId)

    if (applicationsError) {
      console.error('[Tasks] Failed to fetch applications:', applicationsError)
    }

    const professionalIds = applications?.map(app => app.professional_id) || []

    // Start transaction-like operations
    // 1. Delete all applications for this task
    const { error: deleteAppsError } = await adminClient
      .from('applications')
      .delete()
      .eq('task_id', taskId)

    if (deleteAppsError) {
      console.error('[Tasks] Failed to delete applications:', deleteAppsError)
      return NextResponse.json(
        { error: 'Failed to delete applications' },
        { status: 500 }
      )
    }

    // 2. Delete all task-related messages
    const { error: deleteMessagesError } = await adminClient
      .from('messages')
      .delete()
      .eq('task_id', taskId)

    if (deleteMessagesError) {
      console.warn('[Tasks] Failed to delete messages:', deleteMessagesError)
      // Don't fail the request if messages deletion fails
    }

    // 3. Delete all task-related notifications
    const { error: deleteNotificationsError } = await adminClient
      .from('notifications')
      .delete()
      .eq('task_id', taskId)

    if (deleteNotificationsError) {
      console.warn('[Tasks] Failed to delete notifications:', deleteNotificationsError)
      // Don't fail the request if notifications deletion fails
    }

    // 4. Delete task images from Supabase storage
    if (task.images && Array.isArray(task.images) && task.images.length > 0) {
      try {
        // Extract file paths from image URLs
        // Images are stored in Supabase storage with URLs like:
        // https://[project].supabase.co/storage/v1/object/public/task-images/[path]
        const imagePaths = task.images
          .filter((url: string) => url && typeof url === 'string')
          .map((url: string) => {
            // Extract the path after '/task-images/'
            const match = url.match(/\/task-images\/(.+)$/)
            return match ? match[1] : null
          })
          .filter((path): path is string => path !== null)

        if (imagePaths.length > 0) {
          const { error: storageError } = await adminClient
            .storage
            .from('task-images')
            .remove(imagePaths)

          if (storageError) {
            console.warn('[Tasks] Failed to delete images from storage:', storageError)
            // Don't fail the request if image deletion fails
          } else {
            console.log('[Tasks] Deleted task images:', {
              taskId: task.id,
              imageCount: imagePaths.length
            })
          }
        }
      } catch (imageError) {
        console.warn('[Tasks] Error deleting task images:', imageError)
        // Don't fail the request if image deletion fails
      }
    }

    // 5. Update task status to 'cancelled'
    const now = new Date().toISOString()
    const { data: updatedTask, error: updateError } = await adminClient
      .from('tasks')
      .update({
        status: 'cancelled',
        cancelled_at: now,
        updated_at: now
      })
      .eq('id', taskId)
      .select()
      .single()

    if (updateError) {
      console.error('[Tasks] Failed to update task status:', updateError)
      return NextResponse.json(
        { error: 'Failed to cancel task' },
        { status: 500 }
      )
    }

    // 6. Send cancellation notifications to all professionals who applied
    if (professionalIds.length > 0) {
      const notificationPromises = professionalIds.map(professionalId =>
        createNotification({
          userId: professionalId,
          type: 'task_cancelled',
          templateData: {
            taskTitle: task.title,
          },
          metadata: {
            taskId: task.id,
            cancelledBy: user.id,
            cancelledAt: now,
          },
          actionUrl: '/browse-tasks',
          deliveryChannel: 'in_app', // In-app only - not critical
        })
      )

      // Send all notifications in parallel
      const notificationResults = await Promise.allSettled(notificationPromises)

      const successCount = notificationResults.filter(r => r.status === 'fulfilled').length
      const failureCount = notificationResults.length - successCount

      console.log('[Tasks] Cancellation notifications sent:', {
        total: notificationResults.length,
        success: successCount,
        failed: failureCount
      })

      if (failureCount > 0) {
        console.warn('[Tasks] Some notifications failed to send')
      }
    }

    // Log the cancellation event
    console.log('[Tasks] Task cancelled:', {
      taskId: task.id,
      taskTitle: task.title,
      cancelledBy: user.id,
      applicationsDeleted: applications?.length || 0,
      imagesDeleted: task.images?.length || 0,
      notificationsSent: professionalIds.length
    })

    return NextResponse.json({
      success: true,
      message: 'Task cancelled successfully'
    })

  } catch (error) {
    console.error('[Tasks] Error in cancel endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
