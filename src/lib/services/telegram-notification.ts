/**
 * Telegram Notification Service
 *
 * Sends notifications to users via Telegram Bot API
 * Tracks notification delivery and costs in the database
 */

import { createClient } from '@/lib/supabase/server';

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
    const supabase = await createClient();

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
   * Notification when payment is received
   */
  paymentReceived: (amount: number, taskTitle: string) => ({
    message: `💰 <b>Payment Received!</b>\n\nYou received ${amount} BGN for completing "${taskTitle}"\n\nCheck your balance in your profile.`,
    parseMode: 'HTML' as const,
  }),

  /**
   * Welcome notification for new users
   */
  welcome: (userName: string) => ({
    message: `👋 <b>Welcome to Trudify, ${userName}!</b>\n\n🎉 Congratulations! Your account has been created successfully via Telegram.\n\n✅ You'll receive instant notifications here for:\n• New applications on your tasks\n• Messages from professionals\n• Task updates and completions\n\nGet started now:\n📝 Post a task or\n💼 Browse work opportunities!`,
    parseMode: 'HTML' as const,
  }),
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

  const { message, parseMode } = template(...templateArgs);

  return sendTelegramNotification({
    userId,
    message,
    notificationType,
    parseMode,
  });
}
