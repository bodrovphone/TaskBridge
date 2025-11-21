import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createNotification } from '@/lib/services/notification-service'
import { authenticateRequest } from '@/lib/auth/api-auth'

interface RemoveProfessionalRequest {
  reason: string
  description?: string
}

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

    // Parse request body
    const body: RemoveProfessionalRequest = await request.json()
    const { reason, description } = body

    if (!reason) {
      return NextResponse.json(
        { error: 'Removal reason is required' },
        { status: 400 }
      )
    }

    // Get task and verify ownership
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('id, title, customer_id, status, accepted_application_id, selected_professional_id')
      .eq('id', taskId)
      .single()

    if (taskError || !task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    if (task.customer_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (task.status !== 'in_progress') {
      return NextResponse.json(
        { error: 'Can only remove professionals from in_progress tasks' },
        { status: 400 }
      )
    }

    // Get accepted application - check both task foreign key and applications table
    let application = null

    if (task.accepted_application_id) {
      // Try to get application by task's foreign key
      const { data: app, error: appError } = await supabase
        .from('applications')
        .select('id, professional_id, accepted_at')
        .eq('id', task.accepted_application_id)
        .single()

      if (!appError && app) {
        application = app
      }
    }

    // Fallback: Find accepted application by task_id
    if (!application) {
      const { data: apps, error: findError } = await supabase
        .from('applications')
        .select('id, professional_id, accepted_at')
        .eq('task_id', taskId)
        .eq('status', 'accepted')
        .limit(1)

      if (!findError && apps && apps.length > 0) {
        application = apps[0]
      }
    }

    if (!application) {
      return NextResponse.json(
        { error: 'No professional assigned to this task' },
        { status: 400 }
      )
    }

    // Check rate limiting
    const currentMonth = new Date().toISOString().substring(0, 7) // YYYY-MM format
    const { count: removalsThisMonth } = await supabase
      .from('customer_professional_removals')
      .select('*', { count: 'exact', head: true })
      .eq('customer_id', user.id)
      .eq('month_year', currentMonth)

    const maxRemovalsPerMonth = 1
    if ((removalsThisMonth ?? 0) >= maxRemovalsPerMonth) {
      return NextResponse.json(
        {
          error: 'Monthly removal limit reached',
          removalsThisMonth,
          maxRemovalsPerMonth,
        },
        { status: 429 }
      )
    }

    // Calculate days worked
    const acceptedAt = new Date(application.accepted_at)
    const daysWorked = Math.floor(
      (Date.now() - acceptedAt.getTime()) / (1000 * 60 * 60 * 24)
    )

    // Start transaction: Update task, application, track removal
    const { error: updateTaskError } = await supabase
      .from('tasks')
      .update({
        status: 'open',
        selected_professional_id: null,
        accepted_application_id: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', taskId)

    if (updateTaskError) {
      console.error('Error updating task:', updateTaskError)
      return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
    }

    // Update application status
    const { error: updateAppError } = await supabase
      .from('applications')
      .update({
        status: 'removed_by_customer',
        removed_by_customer_at: new Date().toISOString(),
        removal_reason: reason,
        removal_description: description || null,
        days_worked_before_removal: daysWorked,
        updated_at: new Date().toISOString(),
      })
      .eq('id', application.id)

    if (updateAppError) {
      console.error('Error updating application:', updateAppError)
      return NextResponse.json({ error: 'Failed to update application' }, { status: 500 })
    }

    // Track removal in analytics table
    const { error: trackError } = await supabase
      .from('customer_professional_removals')
      .insert({
        customer_id: user.id,
        professional_id: application.professional_id,
        task_id: taskId,
        application_id: application.id,
        reason,
        description: description || null,
        days_worked: daysWorked,
        month_year: currentMonth,
      })

    if (trackError) {
      console.error('Error tracking removal:', trackError)
      // Non-fatal error, continue
    }

    // Set re-hiring restrictions based on reason
    if (['quality_concerns', 'safety_issues'].includes(reason)) {
      // Permanent restriction for quality/safety issues
      const { error: restrictionError } = await supabase
        .from('customer_professional_restrictions')
        .insert({
          customer_id: user.id,
          professional_id: application.professional_id,
          task_id: taskId,
          can_rehire_at: null, // null = never for this task
          reason: `${reason} (permanent restriction)`,
        })

      if (restrictionError) {
        console.error('Error creating restriction:', restrictionError)
        // Non-fatal, continue
      }
    } else if (reason !== 'mutual_agreement') {
      // 7-day cooldown for other reasons (except mutual agreement)
      const cooldownDate = new Date()
      cooldownDate.setDate(cooldownDate.getDate() + 7)

      const { error: restrictionError } = await supabase
        .from('customer_professional_restrictions')
        .insert({
          customer_id: user.id,
          professional_id: application.professional_id,
          task_id: taskId,
          can_rehire_at: cooldownDate.toISOString(),
          reason: `${reason} (7-day cooldown)`,
        })

      if (restrictionError) {
        console.error('Error creating cooldown:', restrictionError)
        // Non-fatal, continue
      }
    }

    // Send notification to professional using notification service
    try {
      await createNotification({
        userId: application.professional_id,
        type: 'removed_by_customer',
        templateData: {
          taskTitle: task.title,
        },
        actionUrl: `/browse-tasks`,
        deliveryChannel: 'both', // Critical: both in-app and Telegram
      })
    } catch (notificationError) {
      console.error('Error sending notification:', notificationError)
      // Non-fatal, continue
    }

    // Calculate remaining removals
    const remainingRemovals = maxRemovalsPerMonth - ((removalsThisMonth ?? 0) + 1)

    return NextResponse.json({
      success: true,
      professionalNotified: true,
      remainingRemovals,
      message: 'Professional removed successfully. Task reopened for new applications.',
    })
  } catch (error) {
    console.error('Error removing professional:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
