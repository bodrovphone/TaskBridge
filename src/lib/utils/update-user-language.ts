import { SupportedLocale } from '@/lib/constants/locales'

/**
 * Updates the authenticated user's preferred language in their profile
 * Silently fails if user is not authenticated (no error thrown)
 */
export async function updateUserLanguagePreference(language: SupportedLocale): Promise<void> {
  try {
    // Call the profile API to update language preference
    const response = await fetch('/api/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        preferredLanguage: language,
      }),
    })

    // If not authenticated (401) or profile not found (404), silently ignore
    if (response.status === 401 || response.status === 404) {
      // User is not logged in or profile doesn't exist - this is fine
      return
    }

    // If other error occurred, log it but don't throw
    if (!response.ok) {
      console.warn('Failed to update user language preference:', await response.text())
      return
    }

    // Success - language preference updated in profile
    console.debug(`User language preference updated to: ${language}`)
  } catch (error) {
    // Network error or other issue - log but don't throw
    console.warn('Error updating user language preference:', error)
  }
}
