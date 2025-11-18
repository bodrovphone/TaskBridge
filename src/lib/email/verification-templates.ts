/**
 * Email Verification Template Helpers
 * Provides translated content for email verification templates
 */

import { en } from '@/lib/intl/en'
import { bg } from '@/lib/intl/bg'
import { ru } from '@/lib/intl/ru'

export type SupportedLocale = 'en' | 'bg' | 'ru'

const translations = {
  en,
  bg,
  ru,
}

interface EmailVerificationData {
  subject: string
  heading: string
  greeting: string
  message: string
  button_text: string
  link_instruction: string
  footer_text: string
  footer_rights: string
  current_year: string
}

/**
 * Get translated email verification content for a locale
 */
export function getEmailVerificationContent(locale: SupportedLocale): EmailVerificationData {
  const t = translations[locale] || translations.en

  return {
    subject: t['auth.email.subject'],
    heading: t['auth.email.heading'],
    greeting: t['auth.email.greeting'],
    message: t['auth.email.message'],
    button_text: t['auth.email.buttonText'],
    link_instruction: t['auth.email.linkInstruction'],
    footer_text: t['auth.email.footerText'],
    footer_rights: t['auth.email.footerRights'],
    current_year: new Date().getFullYear().toString(),
  }
}

/**
 * Extract locale from request URL for initial signup
 * This is only used during signup to capture user's language preference
 */
export function getLocaleFromRequest(request: Request): SupportedLocale {
  try {
    // Check for locale in URL (e.g., /en/signup, /bg/signup)
    const url = new URL(request.url)
    const pathParts = url.pathname.split('/')
    if (pathParts.length > 1 && ['en', 'bg', 'ru'].includes(pathParts[1])) {
      return pathParts[1] as SupportedLocale
    }

    // Check Referer header for locale (user came from a localized page)
    const referer = request.headers.get('referer')
    if (referer) {
      const refererUrl = new URL(referer)
      const refererParts = refererUrl.pathname.split('/')
      if (refererParts.length > 1 && ['en', 'bg', 'ru'].includes(refererParts[1])) {
        return refererParts[1] as SupportedLocale
      }
    }

    // Check Accept-Language header as last resort
    const acceptLanguage = request.headers.get('accept-language')
    if (acceptLanguage) {
      const primaryLang = acceptLanguage.split(',')[0].split('-')[0].toLowerCase()
      if (primaryLang === 'bg' || primaryLang === 'ru') {
        return primaryLang as SupportedLocale
      }
    }
  } catch (error) {
    console.error('[Email] Failed to extract locale:', error)
  }

  // Fallback to Bulgarian (Trudify is a Bulgarian platform)
  return 'bg'
}
