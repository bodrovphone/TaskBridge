/**
 * Task Deadline Reminders Cron Job
 *
 * Runs every day at 8:00 AM UTC
 * Schedule: "0 8 * * *"
 *
 * Reminds professionals 24 hours before task deadline for tasks in progress.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createNotification } from '@/lib/services/notification-service'

export async function GET(request: NextRequest) {
  // Verify cron secret for security
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const supabase = await createClient()

    // Find tasks with deadline in next 24-30 hours
    // (Cron runs at 8 AM daily, so we check for deadlines tomorrow)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(8, 0, 0, 0) // 8 AM tomorrow

    const dayAfterTomorrow = new Date(tomorrow)
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1)

    // Get tasks in progress with deadline approaching
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select(`
        id,
        title,
        deadline,
        user_id,
        applications!inner (
          id,
          professional_id,
          status
        )
      `)
      .eq('status', 'in_progress')
      .eq('applications.status', 'accepted')
      .gte('deadline', tomorrow.toISOString())
      .lt('deadline', dayAfterTomorrow.toISOString())

    if (tasksError) {
      console.error('Error fetching tasks:', tasksError)
      return NextResponse.json(
        { error: tasksError.message },
        { status: 500 }
      )
    }

    if (!tasks || tasks.length === 0) {
      return NextResponse.json({
        message: 'No upcoming deadlines',
        sent: 0,
      })
    }

    const results = []

    for (const task of tasks) {
      try {
        // Get the accepted application
        const application = task.applications?.[0]

        if (!application) {
          continue
        }

        const deadlineDate = new Date(task.deadline)
        const hoursUntil = Math.round(
          (deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60)
        )

        // Create notification for professional
        const result = await createNotification({
          userId: application.professional_id,
          type: 'deadline_reminder',
          title: 'Task Deadline Reminder ⏰',
          message: `"${task.title}" is due in ${hoursUntil} hours. Don't forget to complete and update the status.`,
          metadata: {
            taskId: task.id,
            deadline: task.deadline,
            hoursUntilDeadline: hoursUntil,
          },
          actionUrl: `/tasks/${task.id}`,
          deliveryChannel: 'both', // Critical reminder - always send both
        })

        if (result.success) {
          results.push({
            taskId: task.id,
            professionalId: application.professional_id,
            status: 'sent',
          })
        } else {
          results.push({
            taskId: task.id,
            status: 'failed',
            error: result.error,
          })
        }
      } catch (error) {
        console.error(`Failed to send deadline reminder for task ${task.id}:`, error)
        results.push({
          taskId: task.id,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    return NextResponse.json({
      message: 'Deadline reminders completed',
      totalTasks: tasks.length,
      sent: results.filter(r => r.status === 'sent').length,
      failed: results.filter(r => r.status === 'failed').length,
      results,
    })

  } catch (error) {
    console.error('Deadline reminder cron error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
