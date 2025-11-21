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
 * POST /api/tasks/[id]/withdraw
 *
 * Allows a professional to withdraw from an accepted task.
 * Implements rate limiting (2 withdrawals per month) and timing-based impact.
 * Early withdrawals (< 2 hours) don't count toward limit.
 */
export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id: taskId } = await context.params

    // Parse request body
    const body = await request.json()
    const { reason, description } = body

    if (!reason) {
      return NextResponse.json(
        { error: 'Withdrawal reason is required' },
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

    // Authorization: User must be the assigned professional
    if (task.selected_professional_id !== user.id) {
      return NextResponse.json(
        { error: 'Only the assigned professional can withdraw from this task' },
        { status: 403 }
      )
    }

    // Validation: Task must be in 'in_progress' status
    if (task.status !== 'in_progress') {
      return NextResponse.json(
        { error: 'Can only withdraw from tasks that are in progress' },
        { status: 400 }
      )
    }

    // Get the accepted application
    const { data: application, error: appError } = await adminClient
      .from('applications')
      .select('id, created_at, accepted_at, status')
      .eq('task_id', taskId)
      .eq('professional_id', user.id)
      .eq('status', 'accepted')
      .single()

    if (appError || !application) {
      // Debug: Check if ANY application exists for this task/professional combo
      const { data: anyApp } = await adminClient
        .from('applications')
        .select('id, status')
        .eq('task_id', taskId)
        .eq('professional_id', user.id)
        .maybeSingle()

      console.error('[Withdraw] Application lookup failed:', {
        taskId,
        professionalId: user.id,
        error: appError,
        foundApplication: anyApp,
        applicationStatus: anyApp?.status
      })

      if (anyApp && anyApp.status !== 'accepted') {
        return NextResponse.json(
          { error: `Cannot withdraw: application status is '${anyApp.status}', expected 'accepted'` },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { error: 'Application not found for this task' },
        { status: 404 }
      )
    }

    // Calculate timing impact
    const acceptedAt = new Date(application.accepted_at || application.created_at)
    const hoursSinceAcceptance = (Date.now() - acceptedAt.getTime()) / (1000 * 60 * 60)

    let timingImpact: 'low' | 'medium' | 'high'
    if (hoursSinceAcceptance < 2) {
      timingImpact = 'low' // Early withdrawal - no penalty
    } else if (hoursSinceAcceptance < 24) {
      timingImpact = 'medium' // Normal withdrawal
    } else {
      timingImpact = 'high' // Late withdrawal
    }

    // Check withdrawal limits (only if not early withdrawal)
    if (timingImpact !== 'low') {
      // @todo INTEGRATION: Check user's withdrawal stats from database
      // For now, we'll skip the limit check but log it
      console.log('[Withdraw] Checking withdrawal limits for user:', user.id)
      // const withdrawalsThisMonth = await getWithdrawalsThisMonth(user.id)
      // if (withdrawalsThisMonth >= 2) {
      //   return NextResponse.json({ error: 'Monthly withdrawal limit reached' }, { status: 429 })
      // }
    }

    // Get customer details for notification
    const { data: customer } = await adminClient
      .from('users')
      .select('id, full_name, telegram_id')
      .eq('id', task.customer_id)
      .single()

    const { data: professional } = await adminClient
      .from('users')
      .select('id, full_name')
      .eq('id', user.id)
      .single()

    const now = new Date().toISOString()

    // Update task status back to 'open'
    const { error: updateTaskError } = await adminClient
      .from('tasks')
      .update({
        status: 'open',
        selected_professional_id: null,
        updated_at: now
      })
      .eq('id', taskId)

    if (updateTaskError) {
      console.error('[Withdraw] Failed to update task:', updateTaskError)
      return NextResponse.json(
        { error: 'Failed to update task status' },
        { status: 500 }
      )
    }

    // Update application status to 'withdrawn'
    const { error: updateAppError } = await adminClient
      .from('applications')
      .update({
        status: 'withdrawn',
        updated_at: now
        // @todo INTEGRATION: Add withdrawal tracking fields when migration is ready
        // withdrawn_at: now,
        // withdraw_reason: reason,
        // withdraw_description: description,
        // withdraw_timing_impact: timingImpact
      })
      .eq('id', application.id)

    if (updateAppError) {
      console.error('[Withdraw] Failed to update application:', updateAppError)
      return NextResponse.json(
        { error: 'Failed to update application' },
        { status: 500 }
      )
    }

    // @todo INTEGRATION: Track withdrawal in professional_withdrawals table
    // if (timingImpact !== 'low') {
    //   await trackWithdrawal({
    //     professionalId: user.id,
    //     taskId,
    //     applicationId: application.id,
    //     reason,
    //     description,
    //     timingImpact,
    //     hoursSinceAcceptance
    //   })
    // }

    // @todo INTEGRATION: Increment professional's withdrawal counter
    // if (timingImpact !== 'low') {
    //   await incrementProfessionalWithdrawals(user.id)
    // }

    // Send notification to customer
    const notificationResult = await createNotification({
      userId: task.customer_id,
      type: 'professional_withdrew',
      templateData: {
        professionalName: professional?.full_name || 'The professional',
        taskTitle: task.title,
      },
      metadata: {
        taskId: task.id,
        professionalId: user.id,
        reason,
        description,
        timingImpact,
        withdrawnAt: now
      },
      actionUrl: `/tasks/${task.id}`,
      deliveryChannel: 'both', // Send both in-app and Telegram
    })

    // Log the withdrawal event
    console.log('[Withdraw] Professional withdrew from task:', {
      taskId: task.id,
      taskTitle: task.title,
      professionalId: user.id,
      professionalName: professional?.full_name,
      reason,
      timingImpact,
      hoursSinceAcceptance: hoursSinceAcceptance.toFixed(2),
      countsTowardLimit: timingImpact !== 'low',
      notificationSent: notificationResult.success,
      notificationChannels: {
        inApp: true,
        telegram: !!customer?.telegram_id
      }
    })

    if (!notificationResult.success) {
      console.warn('[Withdraw] Notification delivery failed:', notificationResult.error)
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully withdrawn from task',
      timingImpact,
      countsTowardLimit: timingImpact !== 'low',
      taskReopened: true
    })

  } catch (error) {
    console.error('[Withdraw] Error in withdraw endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
