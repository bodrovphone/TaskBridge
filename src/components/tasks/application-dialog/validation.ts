/**
 * Application form validation helpers
 *
 * These validators prevent users from sharing contact information
 * directly in application messages, keeping communication on-platform.
 */

/**
 * Detects phone numbers in text by checking for more than 6 consecutive digits
 * This catches all phone formats: "0884489289", "088 448 92 89", "0-88-44-89-289", etc.
 */
export function containsPhoneNumber(text: string): boolean {
  // Remove common separators to catch formatted/spaced numbers
  const normalized = text.replace(/[\s\-._*()\[\]\/\\]/g, '')

  // Strict check: more than 6 consecutive digits indicates a phone number
  // 6 digits allows for things like dates (2024), zip codes, etc.
  // 7+ digits is almost certainly contact info
  const consecutiveDigitsRegex = /\d{7,}/
  return consecutiveDigitsRegex.test(normalized)
}

/**
 * Detects URLs and attempts to obfuscate them (e.g., "dot com", "точка com")
 */
export function containsUrl(text: string): boolean {
  // Standard URL patterns
  const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-z0-9]+\.(com|net|org|bg|info|io|co|me|online|ru|ua|eu|uk|de|fr|app|dev|xyz|site|website|link|click)[^\s]*)/gi

  // Obfuscation attempts: "dot com", "d0t com", "точка com", ". com"
  const dotObfuscationRegex = /\b(dot|d0t|точка|тчк|\.\s)\s*(com|net|org|bg|info|io|ru|ua)\b/gi

  // Social media handles that could be contact info
  const socialRegex = /(instagram|telegram|viber|whatsapp|facebook|fb|tg|ig)[\s.:@\/]+[a-z0-9_]+/gi

  return urlRegex.test(text) || dotObfuscationRegex.test(text) || socialRegex.test(text)
}

/**
 * Detects email addresses and obfuscation attempts (e.g., "at gmail", "собака gmail")
 */
export function containsEmail(text: string): boolean {
  // Standard email pattern
  const emailRegex = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi

  // Obfuscation: "at gmail", "@ gmail", "собака gmail" (Russian for @)
  const atObfuscationRegex = /\b(at|собака|sobaka)\s*(gmail|yahoo|hotmail|abv|mail|outlook|proton|icloud|yandex)/gi

  // Pattern like "name at domain" or "name @ domain"
  const spaceAtRegex = /[a-z0-9._%+-]+\s*[@]\s*[a-z0-9.-]+/gi

  return emailRegex.test(text) || atObfuscationRegex.test(text) || spaceAtRegex.test(text)
}

/**
 * Message constraints
 */
export const MESSAGE_MAX_LENGTH = 200

/**
 * Validates application message for forbidden content
 */
export function validateMessage(
  message: string,
  t: (key: string) => string
): string | undefined {
  if (message.length > MESSAGE_MAX_LENGTH) {
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
