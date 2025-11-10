/**
 * Notification Service
 *
 * Smart notification routing system that creates notifications with automatic
 * delivery channel determination (in-app, Telegram, or both) based on notification
 * type and user preferences.
 *
 * Features:
 * - Event-driven notifications (application received, accepted, etc.)
 * - Smart routing (critical = Telegram + in-app, others = in-app only)
 * - User preference overrides
 * - Telegram delivery tracking
 * - Fallback to in-app if Telegram fails
 */

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { sendTelegramNotification } from '@/lib/services/telegram-notification'
import { getNotificationContent, getTelegramMessage, getUserLocale, getViewHereText } from '@/lib/utils/notification-i18n'
import { generateNotificationAutoLoginUrl, type NotificationChannel } from '@/lib/auth/notification-auto-login'

export type NotificationType =
  | 'application_received'
  | 'application_accepted'
  | 'application_rejected'
  | 'task_completed'
  | 'task_status_changed'
  | 'message_received'
  | 'payment_received'
  | 'review_received'
  | 'welcome_message'
  | 'weekly_digest'
  | 'deadline_reminder'

export type DeliveryChannel = 'in_app' | 'telegram' | 'both'

export interface CreateNotificationParams {
  userId: string
  type: NotificationType
  title?: string  // Optional: Will use localized title if not provided
  message?: string  // Optional: Will use localized message if not provided
  metadata?: Record<string, any>
  actionUrl?: string
  deliveryChannel?: DeliveryChannel // Optional: Auto-determined if not provided
  locale?: 'en' | 'bg' | 'ru'  // Optional: Will be fetched from user if not provided
  templateData?: Record<string, any>  // Data for template interpolation (taskTitle, professionalName, etc.)
}

export interface NotificationResult {
  success: boolean
  notificationId?: string
  error?: string
}

/**
 * Default routing rules for notification types
 * Can be overridden by user preferences
 */
const DEFAULT_ROUTING: Record<NotificationType, DeliveryChannel> = {
  // Critical notifications (Telegram + In-app)
  application_accepted: 'both',
  payment_received: 'both',
  task_completed: 'both',
  welcome_message: 'both',
  deadline_reminder: 'both',

  // Important notifications (In-app only by default, user can enable Telegram)
  application_received: 'in_app',
  task_status_changed: 'in_app',
  message_received: 'in_app',
  review_received: 'in_app',

  // Low priority (In-app only)
  application_rejected: 'in_app',
  weekly_digest: 'in_app',
}

/**
 * Determine delivery channel based on notification type and user preferences
 */
function determineDeliveryChannel(
  type: NotificationType,
  userPreferences: any
): DeliveryChannel {
  // Check user preferences for this notification type
  const prefs = userPreferences?.[type] || {}

  // User explicitly wants Telegram
  if (prefs.telegram === true) {
    return 'both'
  }

  // User explicitly disabled Telegram
  if (prefs.telegram === false) {
    return 'in_app'
  }

  // User only wants in-app
  if (prefs.inApp === true && !prefs.telegram) {
    return 'in_app'
  }

  // Fall back to default routing rules
  return DEFAULT_ROUTING[type] || 'in_app'
}

/**
 * Create and optionally deliver a notification
 *
 * @param params - Notification parameters
 * @returns NotificationResult with success status and notification ID
 */
export async function createNotification(
  params: CreateNotificationParams
): Promise<NotificationResult> {
  try {
    // Use admin client to bypass RLS (notifications can be sent to any user)
    const supabase = createAdminClient()

    // Get user preferences, Telegram ID, and locale
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('notification_preferences, telegram_id, full_name, preferred_language')
      .eq('id', params.userId)
      .single()

    if (userError || !user) {
      console.warn(`[Notification] User ${params.userId} not found, skipping notification:`, userError?.message)
      // Don't fail the request - just skip the notification
      // This can happen with test data or if user was deleted
      return {
        success: false,
        error: 'User not found',
      }
    }

    // Determine user's locale
    const userLocale = params.locale || getUserLocale(user)

    // Determine delivery channel (use provided or auto-determine)
    const deliveryChannel = params.deliveryChannel ||
      determineDeliveryChannel(params.type, user.notification_preferences)

    // Get localized content if title/message not provided
    let title = params.title
    let message = params.message

    // Use localized content for supported types
    const localizedTypes = ['welcome_message', 'application_received', 'application_accepted', 'application_rejected', 'task_completed']
    if (localizedTypes.includes(params.type) && (!title || !message)) {
      try {
        const typeMap = {
          'welcome_message': 'welcome',
          'application_received': 'applicationReceived',
          'application_accepted': 'applicationAccepted',
          'application_rejected': 'applicationRejected',
          'task_completed': 'taskCompleted',
        } as const

        const localizedType = typeMap[params.type as keyof typeof typeMap]

        if (localizedType) {
          const content = getNotificationContent(userLocale, localizedType, params.templateData)
          title = title || content.title || 'Notification'
          message = message || content.message || 'You have a new notification'
        }
      } catch (error) {
        console.error('[Notification] Localization failed:', error)
        title = title || 'Notification'
        message = message || 'You have a new notification'
      }
    }

    // Ensure title and message are never null (database requires NOT NULL)
    if (!title || !message) {
      title = title || 'Notification'
      message = message || 'You have a new notification'
    }

    // Generate auto-login URL for in-app notifications (if actionUrl provided)
    let finalActionUrl = params.actionUrl
    if (finalActionUrl) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://trudify.com'

        // Prepend locale if not present
        if (!finalActionUrl.startsWith(`/${userLocale}/`)) {
          finalActionUrl = `/${userLocale}${finalActionUrl}`
        }

        // Generate auto-login URL for in-app notifications
        finalActionUrl = await generateNotificationAutoLoginUrl(
          params.userId,
          'telegram', // Channel doesn't matter for in-app, just need a valid value
          finalActionUrl,
          baseUrl
        )
      } catch (error) {
        console.error('Failed to generate auto-login URL:', error)
        // Fall back to original URL if generation fails
      }
    }

    // Create notification in database
    const { data: notification, error: insertError } = await supabase
      .from('notifications')
      .insert({
        user_id: params.userId,
        type: params.type,
        title: title,  // Use localized title
        message: message,  // Use localized message
        metadata: params.metadata || {},
        action_url: finalActionUrl, // Use auto-login URL
        delivery_channel: deliveryChannel,
        state: 'sent',
      })
      .select()
      .single()

    if (insertError || !notification) {
      console.error('Failed to create notification:', insertError)
      return {
        success: false,
        error: insertError?.message || 'Failed to create notification',
      }
    }

    // Send via Telegram if needed
    if ((deliveryChannel === 'telegram' || deliveryChannel === 'both') && user.telegram_id) {
      try {
        // Get localized Telegram message for supported types
        let telegramMessage: string
        const telegramTypes = ['welcome_message', 'application_received', 'application_accepted', 'task_completed']

        if (telegramTypes.includes(params.type)) {
          const typeMap = {
            'welcome_message': 'welcome',
            'application_received': 'applicationReceived',
            'application_accepted': 'applicationAccepted',
            'task_completed': 'taskCompleted',
          } as const

          const localizedType = typeMap[params.type as keyof typeof typeMap]
          if (localizedType) {
            // Construct auto-login link with session token
            let link = ''
            if (params.actionUrl) {
              const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://trudify.com'
              const viewHereText = getViewHereText(userLocale)

              // Construct final URL with locale
              let finalUrl = params.actionUrl

              // Prepend locale if not already present
              if (!finalUrl.startsWith(`/${userLocale}/`)) {
                finalUrl = `/${userLocale}${finalUrl}`
              }

              // Determine the notification channel (telegram, viber, email, etc.)
              const channel: NotificationChannel = 'telegram' // Default for this context

              // Generate auto-login URL with session token
              try {
                const autoLoginUrl = await generateNotificationAutoLoginUrl(
                  params.userId,
                  channel,
                  finalUrl,
                  baseUrl
                )
                link = `${viewHereText}: ${autoLoginUrl}`
              } catch (error) {
                console.error('Failed to generate auto-login URL for Telegram, using standard URL:', error)
                // Fallback to standard URL without auto-login
                link = `${viewHereText}: ${baseUrl}${finalUrl}`
              }
            }

            // Prepare template data with localized link
            const templateData = {
              ...params.templateData,
              userName: user.full_name || 'there',
              link,
            }

            telegramMessage = getTelegramMessage(userLocale, localizedType, templateData)
          } else {
            // Fallback for unsupported types
            telegramMessage = `<b>${title}</b>\n\n${message}`
          }
        } else {
          // Fallback for non-localized types
          telegramMessage = `<b>${title}</b>\n\n${message}`
        }

        const telegramResult = await sendTelegramNotification({
          userId: params.userId,
          message: telegramMessage,
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

        if (!telegramResult.success) {
          console.warn(`Telegram delivery failed for notification ${notification.id}:`, telegramResult.error)
        }
      } catch (telegramError) {
        console.error('Telegram delivery error:', telegramError)

        // Update notification with failed status
        await supabase
          .from('notifications')
          .update({
            telegram_delivery_status: 'failed',
          })
          .eq('id', notification.id)

        // Don't throw - notification is still saved in-app
      }
    }

    return {
      success: true,
      notificationId: notification.id,
    }

  } catch (error) {
    console.error('Notification service error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Batch create notifications (for cron jobs sending to multiple users)
 *
 * @param notifications - Array of notification parameters
 * @returns Array of results
 */
export async function createNotificationsBatch(
  notifications: CreateNotificationParams[]
): Promise<NotificationResult[]> {
  const results: NotificationResult[] = []

  for (const notification of notifications) {
    const result = await createNotification(notification)
    results.push(result)
  }

  return results
}

/**
 * Get unread notification count for a user
 *
 * @param userId - User ID
 * @returns Number of unread notifications
 */
export async function getUnreadCount(userId: string): Promise<number> {
  try {
    // Use admin client to bypass RLS
    const supabase = createAdminClient()

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('state', 'sent')

    if (error) {
      console.error('Error fetching unread count:', error)
      return 0
    }

    return count || 0
  } catch (error) {
    console.error('Unread count error:', error)
    return 0
  }
}
