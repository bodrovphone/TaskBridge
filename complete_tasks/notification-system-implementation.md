# Notification System Implementation

## Overview
Build a comprehensive notification system with smart delivery routing, state management, and user control. Notifications appear in the in-app notification center and optionally deliver via Telegram based on priority and user preferences.

## Architecture Design

### Core Principles
1. **Avoid Spam**: Not all notifications sent externally, some stay in-app only
2. **User Control**: Users can dismiss notifications individually or in bulk
3. **Smart Routing**: Critical notifications → Telegram + In-app, others → In-app only
4. **State Tracking**: SENT (new/unread) → DISMISSED (read/dismissed by user)
5. **Flexible Delivery**: Future support for email/SMS fallback

---

## Database Schema

### Notifications Table

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Notification content
  type TEXT NOT NULL, -- 'application_received', 'application_accepted', 'task_completed', etc.
  title TEXT NOT NULL,
  message TEXT NOT NULL,

  -- Metadata (JSON for flexibility)
  metadata JSONB DEFAULT '{}'::jsonb, -- { taskId, applicationId, professionalName, etc. }

  -- Delivery & state
  state TEXT NOT NULL DEFAULT 'sent' CHECK (state IN ('sent', 'dismissed')),
  delivery_channel TEXT NOT NULL DEFAULT 'in_app' CHECK (delivery_channel IN ('in_app', 'telegram', 'both')),

  -- External delivery tracking (if sent via Telegram)
  telegram_message_id BIGINT, -- Telegram message ID (for editing/deleting)
  telegram_sent_at TIMESTAMPTZ,
  telegram_delivery_status TEXT, -- 'pending', 'sent', 'failed'

  -- Action URLs
  action_url TEXT, -- Deep link to relevant page (e.g., /tasks/123/applications)

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  dismissed_at TIMESTAMPTZ,

  -- Indexes
  INDEX idx_notifications_user_id (user_id),
  INDEX idx_notifications_state (state),
  INDEX idx_notifications_created_at (created_at),
  INDEX idx_notifications_type (type)
);

-- Index for efficient unread count queries
CREATE INDEX idx_notifications_unread ON notifications(user_id, state)
WHERE state = 'sent';
```

### Notification Preferences (Already exists in users table)

```sql
-- users.notification_preferences JSONB structure:
{
  "applicationReceived": { "inApp": true, "telegram": false },
  "applicationAccepted": { "inApp": true, "telegram": true },
  "applicationRejected": { "inApp": true, "telegram": false },
  "taskCompleted": { "inApp": true, "telegram": true },
  "messageReceived": { "inApp": true, "telegram": true },
  "paymentReceived": { "inApp": true, "telegram": true },
  "reviewReceived": { "inApp": true, "telegram": false },
  "welcomeMessage": { "inApp": true, "telegram": true }
}
```

---

## Notification Types & Default Routing

### Critical Notifications (Telegram + In-app)
- ✅ **application_accepted** - Your application was accepted
- ✅ **payment_received** - Payment confirmed
- ✅ **task_completed** - Task marked complete (needs confirmation)
- ✅ **welcome_message** - Welcome to Trudify!

### Important Notifications (In-app only, optional Telegram)
- 📋 **application_received** - New application on your task (customer only)
- 📊 **task_status_changed** - Task status updated
- 💬 **message_received** - New message/note from customer/professional
- ⭐ **review_received** - You received a review

### Low Priority (In-app only)
- ❌ **application_rejected** - Application not selected (gentle, in-app only)
- 📈 **profile_views** - Someone viewed your profile
- 📅 **weekly_digest** - Weekly task recommendations (future)

---

## API Routes

### 1. Create Notification (Internal Service)

**File**: `/src/lib/services/notification-service.ts`

```typescript
import { createClient } from '@/lib/supabase/server'
import { sendTelegramNotification } from '@/lib/services/telegram-notification'

export type NotificationType =
  | 'application_received'
  | 'application_accepted'
  | 'application_rejected'
  | 'task_completed'
  | 'message_received'
  | 'payment_received'
  | 'review_received'
  | 'welcome_message'

export type DeliveryChannel = 'in_app' | 'telegram' | 'both'

export interface CreateNotificationParams {
  userId: string
  type: NotificationType
  title: string
  message: string
  metadata?: Record<string, any>
  actionUrl?: string
  deliveryChannel?: DeliveryChannel // Auto-determined if not provided
}

/**
 * Smart notification routing based on type and user preferences
 */
function determineDeliveryChannel(
  type: NotificationType,
  userPreferences: any
): DeliveryChannel {
  const prefs = userPreferences?.[type] || {}

  // Default routing rules (can be overridden by user preferences)
  const defaultRouting: Record<NotificationType, DeliveryChannel> = {
    application_accepted: 'both',
    payment_received: 'both',
    task_completed: 'both',
    welcome_message: 'both',
    application_received: 'in_app',
    application_rejected: 'in_app',
    message_received: 'telegram',
    review_received: 'in_app',
  }

  // User preference override
  if (prefs.telegram === true) return 'both'
  if (prefs.telegram === false) return 'in_app'

  return defaultRouting[type] || 'in_app'
}

/**
 * Create and optionally deliver a notification
 */
export async function createNotification(params: CreateNotificationParams) {
  const supabase = await createClient()

  // Get user preferences
  const { data: user } = await supabase
    .from('users')
    .select('notification_preferences, telegram_id')
    .eq('id', params.userId)
    .single()

  if (!user) {
    throw new Error('User not found')
  }

  // Determine delivery channel
  const deliveryChannel = params.deliveryChannel ||
    determineDeliveryChannel(params.type, user.notification_preferences)

  // Create notification in database
  const { data: notification, error } = await supabase
    .from('notifications')
    .insert({
      user_id: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      metadata: params.metadata || {},
      action_url: params.actionUrl,
      delivery_channel: deliveryChannel,
      state: 'sent',
    })
    .select()
    .single()

  if (error) {
    console.error('Failed to create notification:', error)
    throw error
  }

  // Send via Telegram if needed
  if ((deliveryChannel === 'telegram' || deliveryChannel === 'both') && user.telegram_id) {
    try {
      const telegramResult = await sendTelegramNotification({
        userId: params.userId,
        message: `<b>${params.title}</b>\n\n${params.message}`,
        notificationType: params.type,
        parseMode: 'HTML',
      })

      // Update notification with Telegram delivery status
      await supabase
        .from('notifications')
        .update({
          telegram_sent_at: new Date().toISOString(),
          telegram_delivery_status: telegramResult.success ? 'sent' : 'failed',
        })
        .eq('id', notification.id)
    } catch (error) {
      console.error('Failed to send Telegram notification:', error)
      // Don't throw - notification still saved in-app
    }
  }

  return notification
}
```

---

### 2. Get User Notifications

**File**: `/src/app/api/notifications/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse query params
    const { searchParams } = new URL(request.url)
    const state = searchParams.get('state') // 'sent' or 'dismissed'
    const type = searchParams.get('type') // notification type filter
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query
    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (state) {
      query = query.eq('state', state)
    }

    if (type) {
      query = query.eq('type', type)
    }

    const { data: notifications, error, count } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get unread count
    const { count: unreadCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('state', 'sent')

    return NextResponse.json({
      notifications,
      total: count,
      unreadCount,
      hasMore: (offset + limit) < (count || 0),
    })

  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
```

---

### 3. Dismiss Single Notification

**File**: `/src/app/api/notifications/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action } = await request.json() // 'dismiss' or 'undismiss'

    if (!['dismiss', 'undismiss'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Update notification state
    const { data: notification, error } = await supabase
      .from('notifications')
      .update({
        state: action === 'dismiss' ? 'dismissed' : 'sent',
        dismissed_at: action === 'dismiss' ? new Date().toISOString() : null,
      })
      .eq('id', params.id)
      .eq('user_id', user.id) // Security: only user's own notifications
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
    }

    return NextResponse.json({ notification })

  } catch (error) {
    console.error('Error updating notification:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
```

---

### 4. Dismiss All Notifications

**File**: `/src/app/api/notifications/dismiss-all/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Dismiss all sent (unread) notifications
    const { data, error } = await supabase
      .from('notifications')
      .update({
        state: 'dismissed',
        dismissed_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .eq('state', 'sent')
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      dismissedCount: data?.length || 0,
      message: `Dismissed ${data?.length || 0} notifications`,
    })

  } catch (error) {
    console.error('Error dismissing notifications:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
```

---

## Integration Points (Trigger Notifications)

### 1. Application Received

**File**: `/src/app/api/applications/route.ts` (POST handler)

```typescript
import { createNotification } from '@/lib/services/notification-service'

// After application is created successfully:
const application = await supabase
  .from('applications')
  .insert({ ... })
  .select()
  .single()

// Get task and professional info
const { data: task } = await supabase.from('tasks').select('*, user_id').eq('id', applicationData.task_id).single()
const { data: professional } = await supabase.from('users').select('full_name').eq('id', application.professional_id).single()

// Create notification for task owner (customer)
await createNotification({
  userId: task.user_id,
  type: 'application_received',
  title: 'New Application',
  message: `${professional.full_name} applied to your task "${task.title}"`,
  metadata: {
    taskId: task.id,
    applicationId: application.id,
    professionalId: professional.id,
    professionalName: professional.full_name,
    proposedPrice: application.proposed_price,
  },
  actionUrl: `/tasks/${task.id}/applications`,
  deliveryChannel: 'in_app', // In-app only by default
})
```

---

### 2. Application Accepted

**File**: `/src/app/api/applications/[id]/accept/route.ts`

```typescript
import { createNotification } from '@/lib/services/notification-service'

// After application is accepted:
const { data: application } = await supabase
  .from('applications')
  .update({ status: 'accepted' })
  .eq('id', applicationId)
  .select('*, task:tasks(title, user_id)')
  .single()

// Get customer info
const { data: customer } = await supabase.from('users').select('full_name').eq('id', application.task.user_id).single()

// Create notification for professional
await createNotification({
  userId: application.professional_id,
  type: 'application_accepted',
  title: 'Application Accepted! 🎉',
  message: `Your application for "${application.task.title}" was accepted by ${customer.full_name}`,
  metadata: {
    taskId: application.task_id,
    applicationId: application.id,
    customerId: customer.id,
    customerName: customer.full_name,
  },
  actionUrl: `/tasks/${application.task_id}`,
  deliveryChannel: 'both', // Critical: Telegram + In-app
})
```

---

### 3. Welcome Notification

**File**: `/src/lib/services/telegram-bot-handler.ts` (after Telegram connection)

```typescript
import { createNotification } from '@/lib/services/notification-service'

// After user connects Telegram:
await createNotification({
  userId: tokenData.user_id,
  type: 'welcome_message',
  title: 'Welcome to Trudify! 👋',
  message: 'Your account is ready. Start posting tasks or browse available work.',
  metadata: {},
  actionUrl: '/browse-tasks',
  deliveryChannel: 'both', // Welcome via Telegram + In-app
})
```

---

### 4. Application Rejected (Optional - Gentle)

**File**: `/src/app/api/applications/[id]/reject/route.ts`

```typescript
import { createNotification } from '@/lib/services/notification-service'

// After application is rejected:
await createNotification({
  userId: application.professional_id,
  type: 'application_rejected',
  title: 'Application Update',
  message: `Your application for "${task.title}" was not selected this time. Keep applying!`,
  metadata: {
    taskId: application.task_id,
    applicationId: application.id,
  },
  actionUrl: '/browse-tasks',
  deliveryChannel: 'in_app', // In-app only, no Telegram spam
})
```

---

## Frontend: Notification Center Updates

### Connect to Real API

**File**: `/src/components/common/notification-center.tsx`

Replace mock data with real API calls:

```typescript
'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  state: 'sent' | 'dismissed'
  created_at: string
  action_url?: string
  metadata: Record<string, any>
}

export function NotificationCenter() {
  const { t } = useTranslation()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [filter, setFilter] = useState<'all' | 'sent'>('all')
  const [loading, setLoading] = useState(true)

  // Fetch notifications
  async function fetchNotifications() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter === 'sent') params.set('state', 'sent')

      const response = await fetch(`/api/notifications?${params}`)
      const data = await response.json()

      setNotifications(data.notifications)
      setUnreadCount(data.unreadCount)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [filter])

  // Dismiss single notification
  async function dismissNotification(id: string) {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'dismiss' }),
      })

      // Optimistic update
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, state: 'dismissed' } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Failed to dismiss notification:', error)
    }
  }

  // Dismiss all notifications
  async function dismissAll() {
    try {
      await fetch('/api/notifications/dismiss-all', {
        method: 'PATCH',
      })

      // Refresh notifications
      await fetchNotifications()
    } catch (error) {
      console.error('Failed to dismiss all:', error)
    }
  }

  return (
    <div className="notification-center">
      {/* Header with "Mark all read" */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">
          {t('notifications.title')}
        </h2>
        {unreadCount > 0 && (
          <button
            onClick={dismissAll}
            className="text-sm text-blue-600 hover:underline"
          >
            {t('notifications.markAllRead')}
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 p-2 border-b">
        <button
          onClick={() => setFilter('all')}
          className={filter === 'all' ? 'active' : ''}
        >
          {t('notifications.tabAll')}
        </button>
        <button
          onClick={() => setFilter('sent')}
          className={filter === 'sent' ? 'active' : ''}
        >
          {t('notifications.tabUnread')} ({unreadCount})
        </button>
      </div>

      {/* Notification list */}
      <div className="overflow-y-auto max-h-[500px]">
        {loading ? (
          <div className="p-4 text-center text-gray-500">
            {t('common.loading')}
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {t('notifications.empty.message')}
          </div>
        ) : (
          notifications.map(notification => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onDismiss={() => dismissNotification(notification.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}
```

---

---

## Scheduled Notifications (Vercel Cron Jobs)

### Overview
Vercel supports cron jobs natively - they trigger API routes on a schedule. Perfect for weekly digests and deadline reminders.

### Vercel Cron Configuration

**File**: `/vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/cron/weekly-digest",
      "schedule": "0 9 * * 1"
    },
    {
      "path": "/api/cron/deadline-reminders",
      "schedule": "0 8 * * *"
    }
  ]
}
```

**Cron Schedule Format**:
- `0 9 * * 1` = Every Monday at 9:00 AM UTC
- `0 8 * * *` = Every day at 8:00 AM UTC
- Format: `minute hour day month dayOfWeek`

**Security**: Cron endpoints secured with `CRON_SECRET` environment variable

---

### 1. Weekly Task Digest (Professionals)

Send professionals a curated list of new tasks matching their categories and location.

**File**: `/src/app/api/cron/weekly-digest/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createNotification } from '@/lib/services/notification-service'

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = await createClient()

    // Get all professionals who want weekly digest
    const { data: professionals } = await supabase
      .from('users')
      .select('id, full_name, professional_categories, city, telegram_id, notification_preferences')
      .not('professional_categories', 'is', null)
      .or('notification_preferences->weeklyTaskDigest->inApp.eq.true,notification_preferences->weeklyTaskDigest->telegram.eq.true')

    if (!professionals || professionals.length === 0) {
      return NextResponse.json({ message: 'No professionals with digest enabled', sent: 0 })
    }

    const results = []
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    for (const professional of professionals) {
      // Get matching tasks from last 7 days
      const { data: tasks } = await supabase
        .from('tasks')
        .select('id, title, city, budget, category, created_at')
        .in('category', professional.professional_categories || [])
        .eq('city', professional.city)
        .eq('status', 'open')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false })

      if (!tasks || tasks.length === 0) {
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
          message += `• ${task.title} - ${task.city} - ${task.budget} BGN\n`
        })
        if (categoryTasks.length > 2) {
          message += `• +${categoryTasks.length - 2} more\n`
        }
        message += `\n`
      }

      // Determine delivery channel
      const prefs = professional.notification_preferences?.weeklyTaskDigest || {}
      let deliveryChannel: 'in_app' | 'telegram' | 'both' = 'in_app'

      if (prefs.telegram && professional.telegram_id) {
        deliveryChannel = 'both'
      } else if (prefs.inApp) {
        deliveryChannel = 'in_app'
      }

      // Create notification
      try {
        await createNotification({
          userId: professional.id,
          type: 'weekly_digest' as any, // Add to NotificationType enum
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

        results.push({ userId: professional.id, taskCount: tasks.length, status: 'sent' })
      } catch (error) {
        console.error(`Failed to send digest to ${professional.id}:`, error)
        results.push({ userId: professional.id, status: 'failed', error: error.message })
      }
    }

    return NextResponse.json({
      message: 'Weekly digest sent',
      totalProfessionals: professionals.length,
      sent: results.filter(r => r.status === 'sent').length,
      failed: results.filter(r => r.status === 'failed').length,
      results,
    })

  } catch (error) {
    console.error('Weekly digest cron error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
```

---

### 2. Task Deadline Reminders

Remind professionals 24 hours before task deadline.

**File**: `/src/app/api/cron/deadline-reminders/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createNotification } from '@/lib/services/notification-service'

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = await createClient()

    // Find tasks with deadline in next 24-30 hours (daily cron runs at 8 AM)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(8, 0, 0, 0) // 8 AM tomorrow

    const dayAfterTomorrow = new Date(tomorrow)
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1)

    // Get tasks in progress with deadline approaching
    const { data: tasks } = await supabase
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

    if (!tasks || tasks.length === 0) {
      return NextResponse.json({ message: 'No upcoming deadlines', sent: 0 })
    }

    const results = []

    for (const task of tasks) {
      const application = task.applications[0] // Get accepted application

      if (!application) continue

      const deadlineDate = new Date(task.deadline)
      const hoursUntil = Math.round((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60))

      // Create notification for professional
      try {
        await createNotification({
          userId: application.professional_id,
          type: 'deadline_reminder' as any, // Add to NotificationType enum
          title: 'Task Deadline Reminder ⏰',
          message: `"${task.title}" is due in ${hoursUntil} hours. Don't forget to complete and update the status.`,
          metadata: {
            taskId: task.id,
            deadline: task.deadline,
            hoursUntilDeadline: hoursUntil,
          },
          actionUrl: `/tasks/${task.id}`,
          deliveryChannel: 'both', // Critical reminder
        })

        results.push({ taskId: task.id, professionalId: application.professional_id, status: 'sent' })
      } catch (error) {
        console.error(`Failed to send deadline reminder for task ${task.id}:`, error)
        results.push({ taskId: task.id, status: 'failed', error: error.message })
      }
    }

    return NextResponse.json({
      message: 'Deadline reminders sent',
      totalTasks: tasks.length,
      sent: results.filter(r => r.status === 'sent').length,
      failed: results.filter(r => r.status === 'failed').length,
      results,
    })

  } catch (error) {
    console.error('Deadline reminder cron error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
```

---

### 3. Update Notification Type Enum

**File**: `/src/lib/services/notification-service.ts`

```typescript
export type NotificationType =
  | 'application_received'
  | 'application_accepted'
  | 'application_rejected'
  | 'task_completed'
  | 'message_received'
  | 'payment_received'
  | 'review_received'
  | 'welcome_message'
  | 'weekly_digest'        // NEW
  | 'deadline_reminder'    // NEW
```

---

### Environment Variables

**Add to Vercel Environment Variables**:

```bash
# Cron job authentication
CRON_SECRET=your_secure_random_string_here_min_32_chars

# Generate secure secret:
# openssl rand -base64 32
```

**Add to `.env.local` for development**:
```bash
CRON_SECRET=dev_secret_for_local_testing
```

---

### Testing Cron Jobs Locally

Cron jobs don't run locally. Test by calling endpoints directly:

```bash
# Test weekly digest
curl -X GET http://localhost:3000/api/cron/weekly-digest \
  -H "Authorization: Bearer dev_secret_for_local_testing"

# Test deadline reminders
curl -X GET http://localhost:3000/api/cron/deadline-reminders \
  -H "Authorization: Bearer dev_secret_for_local_testing"
```

---

### Vercel Cron Job Monitoring

**View cron logs in Vercel Dashboard**:
1. Go to Vercel Dashboard → Project → Deployments
2. Click on deployment → Functions tab
3. Find cron function executions
4. View logs and execution times

**Vercel Cron Limitations**:
- Maximum execution time: 10 seconds (Hobby plan), 5 minutes (Pro plan)
- Cron jobs run on UTC timezone
- Minimum interval: 1 minute
- Maximum: 12 cron jobs per project

**Best Practices**:
- Keep cron functions fast (<5 seconds)
- Use batching for large datasets
- Log all executions for debugging
- Implement retry logic for failures
- Send admin alerts if cron fails

---

## Migration Script

```sql
-- Run this migration to create notifications table
-- File: /supabase/migrations/create_notifications_table.sql

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,

  metadata JSONB DEFAULT '{}'::jsonb,

  state TEXT NOT NULL DEFAULT 'sent' CHECK (state IN ('sent', 'dismissed')),
  delivery_channel TEXT NOT NULL DEFAULT 'in_app' CHECK (delivery_channel IN ('in_app', 'telegram', 'both')),

  telegram_message_id BIGINT,
  telegram_sent_at TIMESTAMPTZ,
  telegram_delivery_status TEXT,

  action_url TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  dismissed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_state ON notifications(state);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_unread ON notifications(user_id, state) WHERE state = 'sent';

-- RLS Policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own notifications (dismiss)
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);
```

---

## Testing Checklist

### API Endpoints
- [ ] GET /api/notifications - Returns user's notifications
- [ ] GET /api/notifications?state=sent - Returns only unread
- [ ] PATCH /api/notifications/[id] - Dismisses single notification
- [ ] PATCH /api/notifications/dismiss-all - Dismisses all unread

### Notification Creation (Event-Driven)
- [ ] Application received → In-app notification created
- [ ] Application accepted → Telegram + In-app notification
- [ ] Welcome message → Telegram + In-app notification
- [ ] Application rejected → In-app only (no Telegram spam)

### Cron Jobs
- [ ] Weekly digest sends to professionals with matching tasks
- [ ] Weekly digest respects user preferences (in_app vs telegram)
- [ ] Deadline reminders sent 24h before deadline
- [ ] Deadline reminders only sent for in_progress tasks
- [ ] Cron endpoints require CRON_SECRET authorization
- [ ] Cron jobs handle large batches efficiently (<5 seconds)
- [ ] Cron execution logs visible in Vercel dashboard

### Telegram Delivery
- [ ] Telegram notifications sent when delivery_channel = 'both'
- [ ] telegram_sent_at and telegram_delivery_status tracked
- [ ] Notifications still saved in-app if Telegram fails

### Frontend
- [ ] Notification center shows real notifications from API
- [ ] Unread badge shows correct count
- [ ] "Mark all read" button works
- [ ] Individual dismiss works
- [ ] Filter tabs work (All, Unread)
- [ ] Deep links navigate to correct pages

---

## Acceptance Criteria

### Core Infrastructure
- [x] Database schema designed with proper indexes
- [ ] Notification service created with smart routing logic
- [ ] API endpoints implemented (GET, PATCH, PATCH dismiss-all)
- [ ] Notification triggers integrated in application APIs
- [ ] Notification center connected to real API
- [ ] Migration script ready to run

### Telegram Integration
- [ ] Telegram delivery works for 'both' channel notifications
- [ ] No Telegram spam (smart routing respected)
- [ ] telegram_sent_at and telegram_delivery_status tracked
- [ ] Fallback to in-app if Telegram delivery fails

### User Experience
- [ ] Users can dismiss individual notifications
- [ ] Users can dismiss all notifications at once
- [ ] Unread badge updates in real-time
- [ ] Deep links work from notifications
- [ ] Filter tabs work correctly

### Scheduled Notifications (Cron)
- [ ] vercel.json configured with cron schedules
- [ ] CRON_SECRET environment variable set
- [ ] Weekly digest cron job implemented
- [ ] Deadline reminder cron job implemented
- [ ] Cron jobs secured with authorization check
- [ ] Cron execution monitored in Vercel dashboard

---

## Priority

**High** - Core feature for MVP engagement

## Estimated Effort

### Event-Driven Notifications
- Database migration: 1 hour
- Notification service: 3 hours
- API endpoints: 3 hours
- Integration with application APIs: 2 hours
- Frontend updates: 2 hours
- Testing: 2 hours
- **Subtotal: ~13 hours (~2 days)**

### Scheduled Notifications (Cron)
- vercel.json configuration: 0.5 hours
- Weekly digest implementation: 3 hours
- Deadline reminders implementation: 2 hours
- Cron testing and debugging: 1.5 hours
- **Subtotal: ~7 hours (~1 day)**

### **Grand Total: ~20 hours (~3 days)**

---

## Next Steps

1. ✅ Run database migration to create notifications table
2. ✅ Implement notification service with smart routing
3. ✅ Create API endpoints for fetching/dismissing notifications
4. ✅ Integrate notification triggers in application APIs
5. ✅ Update notification center to use real API
6. ✅ Test end-to-end flow
7. ✅ Deploy and monitor delivery rates
