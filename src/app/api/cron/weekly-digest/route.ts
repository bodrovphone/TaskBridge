/**
 * Weekly Task Digest Cron Job
 *
 * Runs every Monday at 9:00 AM UTC
 * Schedule: "0 9 * * 1"
 *
 * Sends professionals a curated list of new tasks from the past 7 days
 * matching their preferred categories and city.
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

    // Get all professionals who want weekly digest
    const { data: professionals, error: profError } = await supabase
      .from('users')
      .select('id, full_name, professional_categories, city, telegram_id, notification_preferences')
      .not('professional_categories', 'is', null)

    if (profError || !professionals || professionals.length === 0) {
      return NextResponse.json({
        message: 'No professionals with categories set',
        sent: 0,
      })
    }

    // Filter professionals who have digest enabled
    const eligibleProfessionals = professionals.filter(prof => {
      const prefs = prof.notification_preferences?.weeklyTaskDigest
      return prefs?.inApp === true || prefs?.telegram === true
    })

    if (eligibleProfessionals.length === 0) {
      return NextResponse.json({
        message: 'No professionals with digest enabled',
        sent: 0,
      })
    }

    const results = []
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    for (const professional of eligibleProfessionals) {
      try {
        // Get matching tasks from last 7 days
        const { data: tasks, error: tasksError } = await supabase
          .from('tasks')
          .select('id, title, city, budget, category, created_at')
          .in('category', professional.professional_categories || [])
          .eq('city', professional.city)
          .eq('status', 'open')
          .gte('created_at', sevenDaysAgo.toISOString())
          .order('created_at', { ascending: false })

        if (tasksError || !tasks || tasks.length === 0) {
          continue // Skip if no matching tasks
        }

        // Group tasks by category
        const tasksByCategory: Record<string, typeof tasks> = {}
        tasks.forEach(task => {
          if (!tasksByCategory[task.category]) {
            tasksByCategory[task.category] = []
          }
          tasksByCategory[task.category].push(task)
        })

        // Build notification message
        const firstName = professional.full_name.split(' ')[0]
        let message = `Hi ${firstName}! Here are ${tasks.length} new tasks in your categories this week:\n\n`

        for (const [category, categoryTasks] of Object.entries(tasksByCategory)) {
          message += `${category} (${categoryTasks.length} tasks)\n`
          const topTasks = categoryTasks.slice(0, 2)
          topTasks.forEach(task => {
            message += `• ${task.title} - ${task.city} - ${task.budget} €\n`
          })
          if (categoryTasks.length > 2) {
            message += `• +${categoryTasks.length - 2} more\n`
          }
          message += `\n`
        }

        // Determine delivery channel based on preferences
        const prefs = professional.notification_preferences?.weeklyTaskDigest || {}
        let deliveryChannel: 'in_app' | 'telegram' | 'both' = 'in_app'

        if (prefs.telegram === true && professional.telegram_id) {
          deliveryChannel = 'both'
        } else if (prefs.inApp === true) {
          deliveryChannel = 'in_app'
        }

        // Create notification
        const result = await createNotification({
          userId: professional.id,
          type: 'weekly_digest',
          title: `Weekly Task Digest - ${tasks.length} New Tasks`,
          message: message.trim(),
          metadata: {
            taskCount: tasks.length,
            categories: Object.keys(tasksByCategory),
            dateRange: {
              from: sevenDaysAgo.toISOString(),
              to: new Date().toISOString(),
            },
          },
          actionUrl: `/browse-tasks?city=${professional.city}`,
          deliveryChannel,
        })

        if (result.success) {
          results.push({
            userId: professional.id,
            taskCount: tasks.length,
            status: 'sent',
          })
        } else {
          results.push({
            userId: professional.id,
            status: 'failed',
            error: result.error,
          })
        }
      } catch (error) {
        console.error(`Failed to send digest to ${professional.id}:`, error)
        results.push({
          userId: professional.id,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    return NextResponse.json({
      message: 'Weekly digest completed',
      totalProfessionals: eligibleProfessionals.length,
      sent: results.filter(r => r.status === 'sent').length,
      failed: results.filter(r => r.status === 'failed').length,
      results,
    })

  } catch (error) {
    console.error('Weekly digest cron error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
