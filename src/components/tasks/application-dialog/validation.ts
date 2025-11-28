/**
 * Application form validation helpers
 *
 * These validators prevent users from sharing contact information
 * directly in application messages, keeping communication on-platform.
 */

/**
 * Detects phone numbers in text, including spaced formats like "0 88 44 892 89"
 */
export function containsPhoneNumber(text: string): boolean {
  // Remove common separators to catch formatted numbers
  const normalized = text.replace(/[\s\-._*()\[\]]/g, '')

  // Match: 10 digits (Bulgaria), +359 followed by 9 digits, or other common patterns
  const phoneRegex = /(\+?\d{1,3}\d{9,11})|\b0\d{9}\b|\b\d{10}\b/g
  return phoneRegex.test(normalized)
}

/**
 * Detects URLs and attempts to obfuscate them (e.g., "dot com")
 */
export function containsUrl(text: string): boolean {
  const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-z0-9]+\.(com|net|org|bg|info|io|co|me|online)[^\s]*)/gi
  const dotComRegex = /\b(dot|d0t)\s*(com|net|org|bg|info)\b/gi
  return urlRegex.test(text) || dotComRegex.test(text)
}

/**
 * Detects email addresses and obfuscation attempts (e.g., "at gmail")
 */
export function containsEmail(text: string): boolean {
  const emailRegex = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi
  const atRegex = /\b(at|@|а)\s*(gmail|yahoo|hotmail|abv|mail)/gi
  return emailRegex.test(text) || atRegex.test(text)
}

/**
 * Validates application message for forbidden content
 */
export function validateMessage(
  message: string,
  t: (key: string) => string
): string | undefined {
  if (message.length > 500) {
    return t('application.errors.messageMax')
  }
  if (containsPhoneNumber(message)) {
    return t('application.errors.noPhoneNumbers')
  }
  if (containsUrl(message)) {
    return t('application.errors.noUrls')
  }
  if (containsEmail(message)) {
    return t('application.errors.noEmails')
  }
  return undefined
}

/**
 * Message constraints
 */
export const MESSAGE_MAX_LENGTH = 200
