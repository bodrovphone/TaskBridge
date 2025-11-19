/**
 * Unified Notification Manager
 *
 * Orchestrates notification delivery with priority logic:
 * 1. If telegram_id exists → Send Telegram + in-app only
 * 2. Else if is_email_verified → Send Email + in-app only
 * 3. Else → Return result indicating banner should be shown
 *
 * Note: In-app notifications always created regardless of external channel
 */

import { getUserNotificationChannel, sendEmailNotification, type NotificationType } from './email-notification';
import { sendTelegramNotification } from './telegram-notification';

export interface NotificationRequest {
  userId: string;
  notificationType: NotificationType;
  templateData: Record<string, any>;
  locale?: string; // Optional, will be fetched from user if not provided
}

export interface NotificationResult {
  success: boolean;
  channel: 'telegram' | 'email' | 'none';
  messageId?: string | number;
  error?: string;
  showBanner?: boolean; // True if user has no notification channels configured
}

/**
 * Sends notification via appropriate channel based on user preferences
 *
 * Priority: Telegram → Email → None
 * - Only ONE external notification is sent
 * - In-app notification always created (future feature)
 */
export async function sendNotification(
  request: NotificationRequest
): Promise<NotificationResult> {
  try {
    // Check which channel user can receive notifications on
    const { channel, canReceiveNotifications } = await getUserNotificationChannel(request.userId);

    // User has no notification channels configured
    if (!canReceiveNotifications || channel === 'none') {
      console.log(`[Notification] User ${request.userId} has no notification channels - show banner`);
      return {
        success: false,
        channel: 'none',
        showBanner: true,
      };
    }

    // Send via Telegram (highest priority)
    if (channel === 'telegram') {
      const result = await sendTelegramNotification({
        userId: request.userId,
        message: formatTelegramMessage(request.notificationType, request.templateData),
        notificationType: request.notificationType,
        parseMode: 'HTML',
      });

      return {
        success: result.success,
        channel: 'telegram',
        messageId: result.messageId,
        error: result.error,
        showBanner: false,
      };
    }

    // Send via Email (second priority)
    if (channel === 'email') {
      const result = await sendEmailNotification({
        userId: request.userId,
        notificationType: request.notificationType,
        templateData: request.templateData,
        locale: request.locale,
      });

      // Handle skip reasons (shouldn't happen if getUserNotificationChannel is correct)
      if (result.skipped) {
        console.warn(`[Notification] Email unexpectedly skipped: ${result.skipReason}`);
        return {
          success: false,
          channel: 'none',
          showBanner: result.skipReason === 'email_not_verified',
          error: result.error,
        };
      }

      return {
        success: result.success,
        channel: 'email',
        messageId: result.messageId,
        error: result.error,
        showBanner: false,
      };
    }

    // Should never reach here
    console.error('[Notification] Unexpected channel state:', channel);
    return {
      success: false,
      channel: 'none',
      showBanner: true,
      error: 'Unexpected channel state',
    };

  } catch (error) {
    console.error('[Notification] Error sending notification:', error);
    return {
      success: false,
      channel: 'none',
      error: 'Internal error',
      showBanner: false,
    };
  }
}

/**
 * Formats notification data into Telegram message format
 * Maps from generic templateData to Telegram-specific message
 */
function formatTelegramMessage(
  notificationType: NotificationType,
  data: Record<string, any>
): string {
  switch (notificationType) {
    case 'applicationReceived':
      return `✅ <b>New Application!</b>\n\n<b>${data.professionalName}</b> has applied to your task:\n"${data.taskTitle}"\n\nCheck your applications to review their offer!`;

    case 'applicationAccepted':
      return `🎉 <b>Application Accepted!</b>\n\nYour application for "${data.taskTitle}" has been accepted by ${data.customerName}!\n\nGet started on the task now.`;

    case 'applicationRejected':
      return `❌ <b>Application Update</b>\n\nYour application for "${data.taskTitle}" was not accepted this time.\n\nKeep applying to other tasks!`;

    case 'messageReceived':
      return `💬 <b>New Message</b>\n\n<b>${data.senderName}</b> sent you a message about "${data.taskTitle}"\n\nView your messages to respond.`;

    case 'taskCompleted':
      return `✅ <b>Task Completed!</b>\n\nThe task "${data.taskTitle}" has been marked as complete.\n\nPlease review and rate ${data.otherPartyRole === 'professional' ? 'the professional' : 'the customer'}.`;

    case 'paymentReceived':
      return `💰 <b>Payment Received!</b>\n\nYou received ${data.amount} BGN for completing "${data.taskTitle}"\n\nCheck your balance in your profile.`;

    case 'welcome':
      return `👋 <b>Welcome to Trudify!</b>\n\n🎉 Congratulations! Your account has been created successfully.\n\n✅ You'll receive instant notifications for:\n• New applications on your tasks\n• Messages from professionals\n• Task updates and completions\n\nGet started now:\n📝 Post a task or\n💼 Browse work opportunities!`;

    case 'removedFromTask':
      return `⚠️ <b>Removed from Task</b>\n\nYou have been removed from the task "${data.taskTitle}" by the customer.\n\nThe task is now open for other professionals to apply.\n\nThis does not negatively affect your rating unless there are quality or safety concerns.\n\nIf you have questions, please contact support.`;

    case 'taskInvitation':
      return `🎯 <b>You've Been Invited!</b>\n\n<b>${data.customerName}</b> has invited you to apply for their task in ${data.taskCategory}:\n\n"${data.taskTitle}"\n\nYou were selected based on your skills and reviews. Apply now before the task is filled!`;

    default:
      return `📬 You have a new notification about "${data.taskTitle || 'a task'}"`;
  }
}

/**
 * Helper to check if user needs to see warning banner
 * Use this before showing create task form or apply to task dialog
 */
export async function shouldShowNotificationWarning(userId: string): Promise<boolean> {
  const { canReceiveNotifications } = await getUserNotificationChannel(userId);
  return !canReceiveNotifications;
}
