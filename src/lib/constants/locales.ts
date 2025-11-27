/**
 * Internationalization constants and configuration
 * Centralized locale management for consistent usage across the application
 */

export const SUPPORTED_LOCALES = ['bg', 'ua', 'en', 'ru'] as const
export const DEFAULT_LOCALE = 'en' as const

export type SupportedLocale = typeof SUPPORTED_LOCALES[number]

/**
 * Language configuration with display information
 * Order: BG, UA, EN, RU (Bulgarian first as primary market)
 */
export const LANGUAGE_CONFIG: Record<SupportedLocale, {
  code: SupportedLocale
  name: string
  flag: string
  region: string
}> = {
  bg: {
    code: 'bg',
    name: 'Български',
    flag: '🇧🇬',
    region: 'BG'
  },
  ua: {
    code: 'ua',
    name: 'Українська',
    flag: '🇺🇦',
    region: 'UA'
  },
  en: {
    code: 'en',
    name: 'English',
    flag: '🇬🇧',
    region: 'GB'
  },
  ru: {
    code: 'ru',
    name: 'Русский',
    flag: '🇷🇺',
    region: 'RU'
  }
} as const

/**
 * Cookie configuration for language preference
 */
export const LOCALE_COOKIE = {
  NAME: 'preferred-language',
  MAX_AGE: 365 * 24 * 60 * 60, // 1 year in seconds
  PATH: '/',
  SAME_SITE: 'lax'
} as const

/**
 * LocalStorage key for client-side language preference backup
 */
export const LOCALE_STORAGE_KEY = 'preferred-language' as const