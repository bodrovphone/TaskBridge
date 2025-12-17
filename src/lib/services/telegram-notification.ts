/**
 * Telegram Notification Service
 *
 * Sends notifications to users via Telegram Bot API
 * Tracks notification delivery and costs in the database
 */

import { createAdminClient } from '@/lib/supabase/server';
import i18next from 'i18next';
import { en } from '@/lib/intl/en';
import { bg } from '@/lib/intl/bg';
import { ru } from '@/lib/intl/ru';
import { uk } from '@/lib/intl/ua';

// Initialize i18next for server-side translations
// Using single braces {variable} to match next-intl syntax
const i18nInstance = i18next.createInstance();
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
    escapeValue: false, // HTML is allowed in Telegram
    prefix: '{',
    suffix: '}',
  },
});

export interface TelegramNotification {
  userId: string;
  message: string;
  notificationType: string;
  parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2';
}

export interface SendNotificationResult {
  success: boolean;
  messageId?: number;
  error?: string;
}

/**
 * Sends a Telegram notification to a user
 *
 * @param notification - Notification details
 * @returns Result with success status and message ID
 */
export async function sendTelegramNotification(
  notification: TelegramNotification
): Promise<SendNotificationResult> {
  const botToken = process.env.TG_BOT_TOKEN;
  if (!botToken) {
    console.error('Telegram bot token not configured');
    return { success: false, error: 'Bot token not configured' };
  }

  try {
    const supabase = createAdminClient();

    // Get user's Telegram ID from database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('telegram_id, telegram_username, full_name')
      .eq('id', notification.userId)
      .single();

    if (userError || !user) {
      console.error('User not found:', userError);
      return { success: false, error: 'User not found' };
    }

    if (!user.telegram_id) {
      console.error('User does not have Telegram ID');
      return { success: false, error: 'User has no Telegram account linked' };
    }

    // Send message via Telegram Bot API
    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: user.telegram_id,
        text: notification.message,
        parse_mode: notification.parseMode || 'HTML',
        disable_web_page_preview: false,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      console.error('Telegram API error:', data);

      // Log failed notification
      await supabase.from('notification_logs').insert({
        user_id: notification.userId,
        channel: 'telegram',
        notification_type: notification.notificationType,
        status: 'failed',
        cost_euros: 0,
        error_message: data.description || 'Unknown error',
        metadata: { telegram_response: data },
      });

      return { success: false, error: data.description || 'Failed to send message' };
    }

    // Log successful notification
    await supabase.from('notification_logs').insert({
      user_id: notification.userId,
      channel: 'telegram',
      notification_type: notification.notificationType,
      status: 'delivered',
      cost_euros: 0, // Telegram is free!
      delivered_at: new Date().toISOString(),
      metadata: {
        message_id: data.result.message_id,
        telegram_chat_id: user.telegram_id,
      },
    });

    console.log(`[Telegram] ✅ Message sent successfully:`, {
      userId: notification.userId,
      userName: user.full_name,
      notificationType: notification.notificationType,
      messageId: data.result.message_id,
      chatId: user.telegram_id,
    });

    return {
      success: true,
      messageId: data.result.message_id,
    };

  } catch (error) {
    console.error('Error sending Telegram notification:', error);
    return { success: false, error: 'Internal error' };
  }
}

/**
 * Predefined notification templates
 */
export const NotificationTemplates = {
  /**
   * Notification when a professional applies to a task
   */
  applicationReceived: (taskTitle: string, professionalName: string) => ({
    message: `✅ <b>New Application!</b>\n\n<b>${professionalName}</b> has applied to your task:\n"${taskTitle}"\n\nCheck your applications to review their offer!`,
    parseMode: 'HTML' as const,
  }),

  /**
   * Notification when customer accepts an application
   */
  applicationAccepted: (taskTitle: string) => ({
    message: `🎉 <b>Application Accepted!</b>\n\nYour application for "${taskTitle}" has been accepted!\n\nGet started on the task now.`,
    parseMode: 'HTML' as const,
  }),

  /**
   * Notification when customer rejects an application
   */
  applicationRejected: (taskTitle: string) => ({
    message: `❌ <b>Application Update</b>\n\nYour application for "${taskTitle}" was not accepted this time.\n\nKeep applying to other tasks!`,
    parseMode: 'HTML' as const,
  }),

  /**
   * Notification when someone sends a message
   */
  messageReceived: (senderName: string, taskTitle: string) => ({
    message: `💬 <b>New Message</b>\n\n<b>${senderName}</b> sent you a message about "${taskTitle}"\n\nView your messages to respond.`,
    parseMode: 'HTML' as const,
  }),

  /**
   * Notification when task is completed
   */
  taskCompleted: (taskTitle: string) => ({
    message: `✅ <b>Task Completed!</b>\n\nThe task "${taskTitle}" has been marked as complete.\n\nPlease review and rate the professional.`,
    parseMode: 'HTML' as const,
  }),

  /**
   * Welcome notification for new users
   */
  welcome: (userName: string) => ({
    message: `👋 <b>Welcome to Trudify, ${userName}!</b>\n\n🎉 Congratulations! Your account has been created successfully via Telegram.\n\n✅ You'll receive instant notifications here for:\n• New applications on your tasks\n• Messages from professionals\n• Task updates and completions\n\nGet started now:\n📝 Post a task or\n💼 Browse work opportunities!`,
    parseMode: 'HTML' as const,
  }),

  /**
   * Notification when customer removes professional from task
   */
  removedByCustomer: (taskTitle: string, customerFeedback?: string) => ({
    message: `⚠️ <b>Removed from Task</b>\n\nYou have been removed from the task "${taskTitle}" by the customer.${customerFeedback ? `\n\n<b>Customer feedback:</b>\n"${customerFeedback}"` : ''}\n\nThe task is now open for other professionals to apply.\n\nThis does not negatively affect your rating unless there are quality or safety concerns.\n\nIf you have questions, please contact support.`,
    parseMode: 'HTML' as const,
  }),

  /**
   * Notification when customer invites professional to a task
   * @param locale - User's preferred language (en, bg, ru)
   * @param taskTitle - Title of the task
   * @param customerName - Name of the customer
   * @param taskCategory - Translated category name
   * @param magicLink - Magic link URL for authentication
   */
  taskInvitation: (locale: string, taskTitle: string, customerName: string, taskCategory: string, magicLink: string) => {
    // Use i18next to get localized template
    const template = i18nInstance.t('notifications.telegram.taskInvitation', {
      lng: locale,
      customerName,
      taskTitle,
      taskCategory,
      link: magicLink,
    });

    return {
      message: template,
      parseMode: 'HTML' as const,
    };
  },
};

/**
 * Helper function to send notification using a template
 */
export async function sendTemplatedNotification(
  userId: string,
  notificationType: keyof typeof NotificationTemplates,
  ...templateArgs: any[]
): Promise<SendNotificationResult> {
  const template = NotificationTemplates[notificationType];
  if (!template) {
    return { success: false, error: 'Unknown notification type' };
  }

  // Type assertion: we know template is a function that returns { message, parseMode }
  const { message, parseMode } = (template as (...args: any[]) => { message: string; parseMode: 'HTML' })(...templateArgs);

  return sendTelegramNotification({
    userId,
    message,
    notificationType,
    parseMode,
  });
}
