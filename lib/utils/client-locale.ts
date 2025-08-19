import { LOCALE_COOKIE, LOCALE_STORAGE_KEY, type SupportedLocale } from '@/lib/constants/locales'

/**
 * Sets user's language preference in both cookie and localStorage
 * @param locale - Locale to save as user preference
 */
export function saveUserLocalePreference(locale: SupportedLocale): void {
  try {
    // Set cookie for server-side detection
    document.cookie = [
      `${LOCALE_COOKIE.NAME}=${locale}`,
      `path=${LOCALE_COOKIE.PATH}`,
      `max-age=${LOCALE_COOKIE.MAX_AGE}`,
      `SameSite=${LOCALE_COOKIE.SAME_SITE}`
    ].join('; ')
    
    // Set localStorage as client-side backup
    localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  } catch (error) {
    console.warn('Failed to save locale preference:', error)
  }
}

/**
 * Gets user's language preference from localStorage (client-side only)
 * @returns Saved locale or null if not found
 */
export function getUserLocalePreference(): SupportedLocale | null {
  try {
    const saved = localStorage.getItem(LOCALE_STORAGE_KEY)
    return saved as SupportedLocale | null
  } catch (error) {
    console.warn('Failed to get locale preference from localStorage:', error)
    return null
  }
}

/**
 * Clears user's language preference from both storage mechanisms
 */
export function clearUserLocalePreference(): void {
  try {
    // Clear cookie
    document.cookie = [
      `${LOCALE_COOKIE.NAME}=`,
      `path=${LOCALE_COOKIE.PATH}`,
      'max-age=0',
      `SameSite=${LOCALE_COOKIE.SAME_SITE}`
    ].join('; ')
    
    // Clear localStorage
    localStorage.removeItem(LOCALE_STORAGE_KEY)
  } catch (error) {
    console.warn('Failed to clear locale preference:', error)
  }
}