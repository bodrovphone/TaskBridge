import { SUPPORTED_LOCALES, type SupportedLocale } from '@/lib/constants/locales'

/**
 * Generate hrefLang alternate URLs for SEO
 * Tells search engines about all language versions of the current page
 *
 * @param pathname - Current page path without locale (e.g., "/browse-tasks")
 * @param baseUrl - Base URL of the site (uses NEXT_PUBLIC_BASE_URL env variable)
 * @returns Object with language alternates for Next.js metadata
 */
export function generateAlternateLanguages(
  pathname: string,
  baseUrl: string = process.env.NEXT_PUBLIC_BASE_URL || 'https://trudify.com'
) {
  const alternates: Record<string, string> = {}

  // Map URL locale to valid ISO 639-1 hreflang code
  // 'ua' is country code, 'uk' is correct language code for Ukrainian
  const hreflangMap: Record<string, string> = {
    ua: 'uk',
  }

  // Add each supported locale
  SUPPORTED_LOCALES.forEach((locale) => {
    const hreflang = hreflangMap[locale] || locale
    alternates[hreflang] = `${baseUrl}/${locale}${pathname}`
  })

  // Add x-default (fallback for unknown languages) - use English
  alternates['x-default'] = `${baseUrl}/en${pathname}`

  return alternates
}

/**
 * Generate canonical URL for the current page
 *
 * @param locale - Current locale
 * @param pathname - Current page path without locale
 * @param baseUrl - Base URL of the site (uses NEXT_PUBLIC_BASE_URL env variable)
 * @returns Canonical URL
 */
export function generateCanonicalUrl(
  locale: SupportedLocale,
  pathname: string,
  baseUrl: string = process.env.NEXT_PUBLIC_BASE_URL || 'https://trudify.com'
): string {
  return `${baseUrl}/${locale}${pathname}`
}
