import { SUPPORTED_LOCALES, DEFAULT_LOCALE, type SupportedLocale } from '@/lib/constants/locales'

/**
 * Language preference with quality score for Accept-Language parsing
 */
interface LanguagePreference {
  locale: string
  quality: number
}

/**
 * Result of locale detection process
 */
export interface LocaleDetectionResult {
  locale: SupportedLocale
  source: 'cookie' | 'browser' | 'default'
  confidence: 'high' | 'medium' | 'low'
}

/**
 * Validates if a given string is a supported locale
 * @param locale - String to validate
 * @returns Type-safe locale if valid, null if invalid
 */
export function validateLocale(locale: string): SupportedLocale | null {
  return SUPPORTED_LOCALES.includes(locale as SupportedLocale) 
    ? (locale as SupportedLocale) 
    : null
}

/**
 * Extracts the main language code from a locale string
 * @param locale - Full locale string (e.g., "en-US", "bg-BG")
 * @returns Main language code (e.g., "en", "bg")
 */
export function extractMainLanguage(locale: string): string {
  return locale.split('-')[0].toLowerCase()
}

/**
 * Parses Accept-Language header into ordered language preferences
 * @param acceptLanguage - Accept-Language header value
 * @returns Ordered array of language preferences by quality
 */
export function parseAcceptLanguageHeader(acceptLanguage: string): LanguagePreference[] {
  if (!acceptLanguage?.trim()) {
    return []
  }

  try {
    return acceptLanguage
      .split(',')
      .map(lang => {
        const [locale, qualityParam = 'q=1'] = lang.split(';')
        const quality = parseFloat(qualityParam.replace('q=', ''))
        
        // Validate quality is a number between 0 and 1
        const normalizedQuality = isNaN(quality) ? 1 : Math.max(0, Math.min(1, quality))
        
        return { 
          locale: extractMainLanguage(locale.trim()), 
          quality: normalizedQuality 
        }
      })
      .sort((a, b) => b.quality - a.quality) // Sort by quality descending
  } catch (error) {
    console.warn('Failed to parse Accept-Language header:', error)
    return []
  }
}

/**
 * Detects the best locale from Accept-Language header
 * @param acceptLanguage - Accept-Language header value
 * @returns Supported locale or null if none found
 */
export function detectLocaleFromBrowser(acceptLanguage: string | null): SupportedLocale | null {
  if (!acceptLanguage) return null

  const preferences = parseAcceptLanguageHeader(acceptLanguage)
  
  // Find the first supported locale from user preferences
  for (const { locale } of preferences) {
    const validLocale = validateLocale(locale)
    if (validLocale) {
      return validLocale
    }
  }

  return null
}

/**
 * Comprehensive locale detection with fallback chain
 * @param cookieValue - Value from locale preference cookie
 * @param acceptLanguage - Accept-Language header value
 * @returns Locale detection result with source and confidence
 */
export function detectUserLocale(
  cookieValue: string | undefined,
  acceptLanguage: string | null
): LocaleDetectionResult {
  // Priority 1: User's explicit choice (cookie)
  if (cookieValue) {
    const validCookieLocale = validateLocale(cookieValue)
    if (validCookieLocale) {
      return {
        locale: validCookieLocale,
        source: 'cookie',
        confidence: 'high'
      }
    }
  }

  // Priority 2: Browser language detection
  const browserLocale = detectLocaleFromBrowser(acceptLanguage)
  if (browserLocale) {
    return {
      locale: browserLocale,
      source: 'browser',
      confidence: 'medium'
    }
  }

  // Priority 3: Default fallback
  return {
    locale: DEFAULT_LOCALE,
    source: 'default',
    confidence: 'low'
  }
}