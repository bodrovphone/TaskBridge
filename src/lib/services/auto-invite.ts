/**
 * Auto-Invite Service
 *
 * Sends bulk invitations to matching professionals when a task is created.
 * Uses the same notification flow as manual customer invitations.
 */

import { createAdminClient } from '@/lib/supabase/server'
import { sendTemplatedNotification } from './telegram-notification'
import { sendEmailNotification } from './email-notification'
import { generateNotificationAutoLoginUrl } from '@/lib/auth/notification-auto-login'
import {
  findMatchingProfessionals,
  MatchingProfessional,
} from './professional-matching'
import { getFeatureFlags } from '@/lib/config/feature-flags'
import { getCategoryLabelBySlug } from '@/features/categories'
import i18next from 'i18next'
import { en } from '@/lib/intl/en'
import { bg } from '@/lib/intl/bg'
import { ru } from '@/lib/intl/ru'
import { uk } from '@/lib/intl/ua'

// Initialize i18next for server-side category translation
const i18nInstance = i18next.createInstance()
i18nInstance.init({
  lng: 'en',
  fallbackLng: 'en',
  resources: {
    en: { translation: en },
    bg: { translation: bg },
    ru: { translation: ru },
    ua: { translation: uk },
  },
  interpolation: {
    prefix: '{',
    suffix: '}',
  },
})

export interface AutoInviteTaskData {
  taskId: string
  taskTitle: string
  category: string // Category or subcategory slug
  city: string
  customerId: string
  customerName: string
}

export interface AutoInviteResult {
  invitedCount: number
  skippedCount: number
  errors: string[]
}

/**
 * Send auto-invitations to matching professionals
 *
 * This mirrors the logic in /api/professionals/[id]/invite/route.ts
 * but handles multiple professionals in bulk.
 *
 * @param taskData - Task information for matching and notification
 * @returns Result with counts and any errors
 */
export async function sendAutoInvitations(
  taskData: AutoInviteTaskData
): Promise<AutoInviteResult> {
  const result: AutoInviteResult = {
    invitedCount: 0,
    skippedCount: 0,
    errors: [],
  }

  // Check feature flag
  const flags = getFeatureFlags()
  if (!flags.autoInviteProfessionals) {
    console.log('[AutoInvite] Feature disabled')
    return result
  }

  try {
    // Find matching professionals
    const professionals = await findMatchingProfessionals({
      taskId: taskData.taskId,
      category: taskData.category,
      city: taskData.city,
      customerId: taskData.customerId,
      limit: flags.autoInviteMaxPerTask,
    })

    if (professionals.length === 0) {
      console.log('[AutoInvite] No matching professionals found')
      return result
    }

    console.log(
      `[AutoInvite] Found ${professionals.length} matching professionals for task ${taskData.taskId}`
    )

    // Send invitations in parallel
    const invitePromises = professionals.map((professional) =>
      sendInvitationToProfessional(taskData, professional, result)
    )

    await Promise.all(invitePromises)

    console.log(
      `[AutoInvite] Completed: ${result.invitedCount} invited, ${result.skippedCount} skipped, ${result.errors.length} errors`
    )

    return result
  } catch (error) {
    console.error('[AutoInvite] Fatal error:', error)
    result.errors.push(
      `Fatal error: ${error instanceof Error ? error.message : 'Unknown'}`
    )
    return result
  }
}

/**
 * Send invitation to a single professional
 * Mirrors the manual invite flow from /api/professionals/[id]/invite
 */
async function sendInvitationToProfessional(
  taskData: AutoInviteTaskData,
  professional: MatchingProfessional,
  result: AutoInviteResult
): Promise<void> {
  const supabase = createAdminClient()

  try {
    const userLocale = professional.preferred_language || 'bg'
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://trudify.com'

    // Generate action URL with locale
    let actionUrl = `/tasks/${taskData.taskId}`
    if (!actionUrl.startsWith(`/${userLocale}/`)) {
      actionUrl = `/${userLocale}${actionUrl}`
    }

    const finalActionUrl = `${baseUrl}${actionUrl}`

    // Create in-app notification (same as manual invite)
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: professional.id,
        type: 'task_invitation',
        title: 'New Task Invitation',
        message: `${taskData.customerName} has invited you to apply for their task`,
        metadata: {
          taskId: taskData.taskId,
          customerId: taskData.customerId,
          customerName: taskData.customerName,
          taskTitle: taskData.taskTitle,
          taskCategory: taskData.category,
          autoInvite: true, // Mark as auto-invite for analytics
        },
        action_url: finalActionUrl,
      })

    if (notificationError) {
      console.error(
        `[AutoInvite] Failed to create notification for ${professional.id}:`,
        notificationError
      )
      result.errors.push(`Notification failed for ${professional.id}`)
      result.skippedCount++
      return
    }

    // Send external notification: Telegram (priority) → Email (fallback)
    // Translate category to recipient's language
    const t = i18nInstance.getFixedT(userLocale)
    const translatedCategory = getCategoryLabelBySlug(taskData.category, t)

    if (professional.telegram_id) {
      // Priority 1: Send Telegram notification with magic link
      try {
        const telegramAutoLoginUrl = await generateNotificationAutoLoginUrl(
          professional.id,
          'telegram',
          actionUrl,
          baseUrl
        )

        await sendTemplatedNotification(
          professional.id,
          'taskInvitation',
          userLocale,
          taskData.taskTitle,
          taskData.customerName,
          translatedCategory,
          telegramAutoLoginUrl
        )
      } catch (telegramError) {
        console.error(
          `[AutoInvite] Telegram failed for ${professional.id}:`,
          telegramError
        )
        // Don't fail the whole invite if Telegram fails
      }
    } else if (professional.is_email_verified) {
      // Priority 2: Send Email notification (no Telegram available)
      try {
        await sendEmailNotification({
          userId: professional.id,
          notificationType: 'taskInvitation',
          templateData: {
            taskId: taskData.taskId,
            taskTitle: taskData.taskTitle,
            taskCategory: translatedCategory,
            customerName: taskData.customerName,
          },
          locale: userLocale,
        })
      } catch (emailError) {
        console.error(
          `[AutoInvite] Email failed for ${professional.id}:`,
          emailError
        )
        // Don't fail the whole invite if email fails
      }
    }
    // If neither Telegram nor Email available, in-app notification was still created above

    result.invitedCount++
  } catch (error) {
    console.error(`[AutoInvite] Error inviting ${professional.id}:`, error)
    result.errors.push(
      `Error for ${professional.id}: ${error instanceof Error ? error.message : 'Unknown'}`
    )
    result.skippedCount++
  }
}

/**
 * Fire-and-forget wrapper for auto-invitations
 * Use this in task creation flow to not block the response
 */
export function sendAutoInvitationsAsync(taskData: AutoInviteTaskData): void {
  // Don't await - let it run in background
  sendAutoInvitations(taskData).catch((error) => {
    console.error('[AutoInvite] Background execution failed:', error)
  })
}
