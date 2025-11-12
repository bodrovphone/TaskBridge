/**
 * Server-side notification localization utility
 *
 * This module provides localized content for notifications without requiring React context.
 * It directly accesses the translation resources for server-side notification generation.
 */

import enMessages from '@/lib/intl/en';
import bgMessages from '@/lib/intl/bg';
import ruMessages from '@/lib/intl/ru';

type Locale = 'en' | 'bg' | 'ru';

const messages = {
  en: enMessages,
  bg: bgMessages,
  ru: ruMessages,
};

/**
 * Simple template string interpolation
 * Replaces {{key}} placeholders with values from data object
 */
function interpolate(template: string, data: Record<string, any>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] !== undefined ? String(data[key]) : match;
  });
}

/**
 * Get translated notification content (title + message)
 */
export function getNotificationContent(
  locale: Locale,
  type: 'welcome' | 'applicationReceived' | 'applicationAccepted' | 'applicationRejected' | 'taskCompleted' | 'professionalWithdrew',
  data?: Record<string, any>
): { title: string; message: string } {
  const lang = messages[locale] || messages.en;

  const titleKey = `notifications.content.${type}.title`;
  const messageKey = `notifications.content.${type}.message`;

  // Access using string indexing (lang is a Record<string, string>)
  const langRecord = lang as Record<string, string>;
  let title = langRecord[titleKey] || 'Notification';
  let message = langRecord[messageKey] || 'You have a new notification';

  // Debug logging
  if (!langRecord[titleKey] || !langRecord[messageKey]) {
    console.warn(`[Notification i18n] Missing translation for ${type} in ${locale}:`, {
      titleKey,
      messageKey,
      titleExists: !!langRecord[titleKey],
      messageExists: !!langRecord[messageKey],
      sampleKeys: Object.keys(langRecord).filter(k => k.startsWith('notifications.content')).slice(0, 5),
    });
  }

  // Interpolate variables if provided
  if (data) {
    title = interpolate(title, data);
    message = interpolate(message, data);
  }

  return { title, message };
}

/**
 * Get localized Telegram notification message
 */
export function getTelegramMessage(
  locale: Locale,
  type: 'welcome' | 'applicationReceived' | 'applicationAccepted' | 'taskCompleted' | 'professionalWithdrew',
  data: Record<string, any>
): string {
  const lang = messages[locale] || messages.en;

  const key = `notifications.telegram.${type}` as keyof typeof lang;
  let template = lang[key] as string;

  if (!template) {
    // Fallback to English if translation missing
    template = messages.en[key] as string;
  }

  // Interpolate variables
  return interpolate(template, data);
}

/**
 * Get user's preferred locale from database user object
 */
export function getUserLocale(user: { preferred_language?: string }): Locale {
  const locale = user.preferred_language?.toLowerCase();

  if (locale === 'bg' || locale === 'ru' || locale === 'en') {
    return locale;
  }

  // Default to Bulgarian (primary market)
  return 'bg';
}

/**
 * Get localized "View here" text for Telegram links
 */
export function getViewHereText(locale: Locale): string {
  const lang = messages[locale] || messages.en;
  const key = 'notifications.telegram.viewHere' as keyof typeof lang;
  return (lang[key] as string) || 'View here';
}
