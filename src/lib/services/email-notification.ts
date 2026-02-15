/**
 * Email Notification Service
 *
 * Sends notifications to users via Resend when:
 * - User has NO Telegram connected (telegram_id IS NULL)
 * - User has verified email (is_email_verified = true)
 *
 * Priority: Telegram -> Email -> None
 * - If telegram_id exists: Send Telegram only
 * - Else if is_email_verified: Send Email only
 * - Else: No external notification (show warning banner)
 */

import { createAdminClient } from '@/lib/supabase/server';
import i18next from 'i18next';
import { en } from '@/lib/intl/en';
import { bg } from '@/lib/intl/bg';
import { ru } from '@/lib/intl/ru';
import { uk } from '@/lib/intl/ua';
import { generateNotificationAutoLoginUrl } from '@/lib/auth/notification-auto-login';
import { sendNotificationEmail } from '@/lib/services/resend-email';

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
    escapeValue: false,
    prefix: '{',
    suffix: '}',
  },
});

export interface EmailNotification {
  userId: string;
  notificationType: NotificationType;
  templateData: Record<string, any>;
  locale?: string; // Optional, will be fetched from user if not provided
}

export type NotificationType =
  | 'applicationReceived'
  | 'applicationAccepted'
  | 'applicationRejected'
  | 'messageReceived'
  | 'taskCompleted'
  | 'paymentReceived'
  | 'welcome'
  | 'removedFromTask'
  | 'taskInvitation';

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  skipped?: boolean;
  skipReason?: 'has_telegram' | 'email_not_verified' | 'no_resend_key';
}

/**
 * Sends an email notification using Resend with React Email templates
 */
export async function sendEmailNotification(
  notification: EmailNotification
): Promise<SendEmailResult> {
  if (!process.env.RESEND_API_KEY) {
    console.error('Resend API key not configured');
    return { success: false, error: 'Resend not configured', skipped: true, skipReason: 'no_resend_key' };
  }

  try {
    const supabase = createAdminClient();

    // Get user details
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('email, telegram_id, is_email_verified, preferred_language, full_name')
      .eq('id', notification.userId)
      .single();

    if (userError || !user) {
      console.error('User not found:', userError);
      return { success: false, error: 'User not found' };
    }

    // Check priority: Telegram -> Email -> None
    if (user.telegram_id) {
      console.log(`[Email] Skipping email for user ${notification.userId}: has Telegram`);
      return { success: false, skipped: true, skipReason: 'has_telegram' };
    }

    if (!user.is_email_verified) {
      console.log(`[Email] Skipping email for user ${notification.userId}: email not verified`);
      return { success: false, skipped: true, skipReason: 'email_not_verified' };
    }

    // Get user's locale
    const locale = notification.locale || user.preferred_language || 'bg';

    // Translate all template variables
    const translatedData = await translateEmailVariables(
      notification.userId,
      notification.notificationType,
      notification.templateData,
      locale,
      user.full_name || user.email.split('@')[0]
    );

    // Send email via Resend
    const { data: resendData, error: resendError } = await sendNotificationEmail(
      user.email,
      translatedData.subject,
      {
        heading: translatedData.heading,
        greeting: translatedData.greeting,
        userName: translatedData.user_name,
        message: translatedData.message,
        primaryLink: translatedData.primary_link,
        primaryButtonText: translatedData.primary_button_text,
        secondaryLink: translatedData.secondary_link,
        secondaryButtonText: translatedData.secondary_button_text,
        secondaryMessage: translatedData.secondary_message,
        infoTitle: translatedData.info_title,
        infoItems: translatedData.info_items,
        footerText: translatedData.footer_text,
        footerRights: translatedData.footer_rights,
        currentYear: translatedData.current_year,
      }
    );

    if (resendError) {
      console.error('Resend API error:', resendError);

      // Log failed notification
      await supabase.from('notification_logs').insert({
        user_id: notification.userId,
        channel: 'email',
        notification_type: notification.notificationType,
        status: 'failed',
        cost_euros: 0,
        error_message: `Resend error: ${resendError.message}`,
        metadata: { resend_error: resendError },
      });

      return { success: false, error: `Resend error: ${resendError.message}` };
    }

    const messageId = resendData?.id;

    // Log successful notification
    await supabase.from('notification_logs').insert({
      user_id: notification.userId,
      channel: 'email',
      notification_type: notification.notificationType,
      status: 'delivered',
      cost_euros: 0, // Resend free tier
      delivered_at: new Date().toISOString(),
      metadata: {
        message_id: messageId,
        provider: 'resend',
        locale,
      },
    });

    console.log(`[Email] Notification sent to ${user.email} (${notification.notificationType})`);

    return {
      success: true,
      messageId,
    };

  } catch (error) {
    console.error('Error sending email notification:', error);
    return { success: false, error: 'Internal error' };
  }
}

/**
 * Translates email template variables based on notification type and locale
 */
async function translateEmailVariables(
  userId: string,
  notificationType: NotificationType,
  data: Record<string, any>,
  locale: string,
  userName: string
): Promise<Record<string, any>> {
  const t = (key: string, vars?: Record<string, any>) => {
    return i18nInstance.t(key, { lng: locale, ...vars });
  };

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://trudify.com';
  const currentYear = new Date().getFullYear().toString();

  // Common variables for all emails
  const common = {
    greeting: t('notifications.email.common.greeting'),
    user_name: userName,
    footer_rights: t('notifications.email.common.footerRights'),
    current_year: currentYear,
  };

  // Type-specific variable mapping
  switch (notificationType) {
    case 'applicationReceived': {
      // Generate magic link for auto-login
      const taskPageUrl = await generateNotificationAutoLoginUrl(
        userId,
        'email',
        `/${locale}/tasks/${data.taskId}?application=${data.applicationId}`,
        baseUrl
      );

      return {
        ...common,
        subject: t('notifications.email.applicationReceived.subject', {
          customer_name: userName,
        }),
        heading: t('notifications.email.applicationReceived.heading'),
        message: t('notifications.email.applicationReceived.message', {
          professional_name: data.professionalName,
          task_title: data.taskTitle,
        }),
        primary_link: taskPageUrl,
        primary_button_text: t('notifications.email.applicationReceived.buttonText'),
        secondary_link: data.professionalProfileLink || `${baseUrl}/${locale}/professionals/${data.professionalId}`,
        secondary_button_text: t('notifications.email.applicationReceived.secondaryButtonText'),
        info_title: t('notifications.email.applicationReceived.infoTitle'),
        info_items: data.infoItems || [], // e.g., ["Offered Price: 50 EUR", "Rating: 4.8"]
        footer_text: t('notifications.email.applicationReceived.footerText'),
      };
    }

    case 'applicationAccepted': {
      // Build info items: contact info first, then customer message if provided
      const infoItems: string[] = [];

      // Add customer contact info (passed as string like "+359..." or "email@...")
      if (data.customerContact) {
        infoItems.push(`${t('notifications.email.applicationAccepted.contactLabel', { defaultValue: 'Contact' })}: ${data.customerContact}`);
      }

      // Add customer message if provided
      if (data.customerMessage) {
        infoItems.push(`${t('notifications.email.applicationAccepted.customerMessageLabel', { defaultValue: 'Message' })}: "${data.customerMessage}"`);
      }

      // Generate magic link to /tasks/work page
      const workPageUrl = await generateNotificationAutoLoginUrl(
        userId,
        'email',
        `/${locale}/tasks/work`,
        baseUrl
      );

      return {
        ...common,
        subject: t('notifications.email.applicationAccepted.subject'),
        heading: t('notifications.email.applicationAccepted.heading'),
        message: t('notifications.email.applicationAccepted.message', {
          task_title: data.taskTitle,
          customer_name: data.customerName,
        }),
        primary_link: workPageUrl,
        primary_button_text: t('notifications.email.applicationAccepted.buttonText'),
        info_title: t('notifications.email.applicationAccepted.infoTitle'),
        info_items: infoItems,
        secondary_message: t('notifications.email.applicationAccepted.secondaryMessage'),
        footer_text: t('notifications.email.applicationAccepted.footerText'),
      };
    }

    case 'applicationRejected':
      return {
        ...common,
        subject: t('notifications.email.applicationRejected.subject', {
          task_title: data.taskTitle,
        }),
        heading: t('notifications.email.applicationRejected.heading'),
        message: t('notifications.email.applicationRejected.message', {
          task_title: data.taskTitle,
        }),
        primary_link: `${baseUrl}/${locale}/browse-tasks`,
        primary_button_text: t('notifications.email.applicationRejected.buttonText'),
        secondary_message: t('notifications.email.applicationRejected.secondaryMessage'),
        footer_text: t('notifications.email.applicationRejected.footerText'),
      };

    case 'messageReceived':
      return {
        ...common,
        subject: t('notifications.email.messageReceived.subject', {
          sender_name: data.senderName,
        }),
        heading: t('notifications.email.messageReceived.heading'),
        message: t('notifications.email.messageReceived.message', {
          sender_name: data.senderName,
          task_title: data.taskTitle,
        }),
        primary_link: `${baseUrl}/${locale}/tasks/${data.taskId}/messages`,
        primary_button_text: t('notifications.email.messageReceived.buttonText'),
        info_title: t('notifications.email.messageReceived.infoTitle'),
        info_items: data.messagePreview ? [`"${data.messagePreview.substring(0, 150)}..."`] : [],
        secondary_message: t('notifications.email.messageReceived.secondaryMessage'),
        footer_text: t('notifications.email.messageReceived.footerText'),
      };

    case 'taskCompleted': {
      // Generate auto-login URL for review page
      const reviewUrl = await generateNotificationAutoLoginUrl(
        userId,
        'email',
        `/${locale}/reviews/pending`,
        baseUrl
      );

      return {
        ...common,
        subject: t('notifications.email.taskCompleted.subject', {
          task_title: data.taskTitle,
        }),
        heading: t('notifications.email.taskCompleted.heading'),
        message: t('notifications.email.taskCompleted.message', {
          task_title: data.taskTitle,
        }),
        primary_link: reviewUrl,
        primary_button_text: t('notifications.email.taskCompleted.buttonText'),
        secondary_message: t('notifications.email.taskCompleted.secondaryMessage'),
        footer_text: t('notifications.email.taskCompleted.footerText'),
      };
    }

    case 'paymentReceived':
      return {
        ...common,
        subject: t('notifications.email.paymentReceived.subject', {
          task_title: data.taskTitle,
        }),
        heading: t('notifications.email.paymentReceived.heading'),
        message: t('notifications.email.paymentReceived.message', {
          amount: data.amount,
          task_title: data.taskTitle,
        }),
        primary_link: `${baseUrl}/${locale}/profile/professional`,
        primary_button_text: t('notifications.email.paymentReceived.buttonText'),
        info_title: t('notifications.email.paymentReceived.infoTitle'),
        info_items: data.paymentDetails || [
          `Amount: ${data.amount} EUR`,
          `Task: ${data.taskTitle}`,
          `Date: ${new Date().toLocaleDateString(locale)}`,
        ],
        secondary_message: t('notifications.email.paymentReceived.secondaryMessage'),
        footer_text: t('notifications.email.paymentReceived.footerText'),
      };

    case 'welcome':
      return {
        ...common,
        subject: t('notifications.email.welcome.subject', {
          user_name: userName,
        }),
        heading: t('notifications.email.welcome.heading'),
        message: t('notifications.email.welcome.message'),
        primary_link: `${baseUrl}/${locale}/dashboard`,
        primary_button_text: t('notifications.email.welcome.buttonText'),
        info_title: t('notifications.email.welcome.infoTitle'),
        info_items: [
          'Post tasks and find trusted professionals',
          'Apply for work and earn money',
          'Instant notifications for all updates',
          'Secure payments and reviews',
        ],
        secondary_message: t('notifications.email.welcome.secondaryMessage'),
        footer_text: t('notifications.email.welcome.footerText'),
      };

    case 'removedFromTask': {
      // Format customer feedback for email display (empty string if not provided)
      const feedbackLabel = t('notifications.email.removedFromTask.feedbackLabel', { defaultValue: 'Feedback' });
      const customerFeedback = data.customerFeedback
        ? `\n\n${feedbackLabel}: "${data.customerFeedback}"`
        : '';

      return {
        ...common,
        subject: t('notifications.email.removedFromTask.subject', {
          task_title: data.taskTitle,
        }),
        heading: t('notifications.email.removedFromTask.heading'),
        message: t('notifications.email.removedFromTask.message', {
          task_title: data.taskTitle,
          customerFeedback,
        }),
        primary_link: `${baseUrl}/${locale}/browse-tasks`,
        primary_button_text: t('notifications.email.removedFromTask.buttonText'),
        secondary_message: t('notifications.email.removedFromTask.secondaryMessage'),
        footer_text: t('notifications.email.removedFromTask.footerText'),
      };
    }

    case 'taskInvitation':
      return {
        ...common,
        subject: t('notifications.email.taskInvitation.subject', {
          customer_name: data.customerName,
        }),
        heading: t('notifications.email.taskInvitation.heading'),
        message: t('notifications.email.taskInvitation.message', {
          customer_name: data.customerName,
          task_category: data.taskCategory,
        }),
        primary_link: `${baseUrl}/${locale}/tasks/${data.taskId}`,
        primary_button_text: t('notifications.email.taskInvitation.buttonText'),
        info_title: t('notifications.email.taskInvitation.infoTitle'),
        info_items: [
          `Task: ${data.taskTitle}`,
          `Category: ${data.taskCategory}`,
          `Customer: ${data.customerName}`,
        ],
        secondary_message: t('notifications.email.taskInvitation.secondaryMessage'),
        footer_text: t('notifications.email.taskInvitation.footerText'),
      };

    default:
      throw new Error(`Unknown notification type: ${notificationType}`);
  }
}

/**
 * Helper function to check user's notification channel availability
 */
export async function getUserNotificationChannel(userId: string): Promise<{
  channel: 'telegram' | 'email' | 'none';
  canReceiveNotifications: boolean;
}> {
  try {
    const supabase = createAdminClient();

    const { data: user, error } = await supabase
      .from('users')
      .select('telegram_id, is_email_verified')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return { channel: 'none', canReceiveNotifications: false };
    }

    // Priority: Telegram -> Email -> None
    if (user.telegram_id) {
      return { channel: 'telegram', canReceiveNotifications: true };
    }

    if (user.is_email_verified) {
      return { channel: 'email', canReceiveNotifications: true };
    }

    return { channel: 'none', canReceiveNotifications: false };

  } catch (error) {
    console.error('Error checking notification channel:', error);
    return { channel: 'none', canReceiveNotifications: false };
  }
}
