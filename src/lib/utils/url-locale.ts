import { type SupportedLocale } from '@/lib/constants/locales'
import { validateLocale } from './locale-detection'

/**
 * Regular expression for matching locale in URL paths
 * Matches: /en, /bg, /ru (with optional trailing slash and content)
 */
const LOCALE_PATH_REGEX = /^\/(en|bg|ru)(\/|$)/

/**
 * Extracts locale from a URL pathname
 * @param pathname - URL pathname (e.g., "/en/browse-tasks")
 * @returns Locale if found and valid, null otherwise
 */
export function extractLocaleFromPathname(pathname: string): SupportedLocale | null {
  const segments = pathname.split('/').filter(Boolean)
  const firstSegment = segments[0]
  
  return firstSegment ? validateLocale(firstSegment) : null
}

/**
 * Checks if a pathname already contains a locale
 * @param pathname - URL pathname to check
 * @returns True if pathname starts with a supported locale
 */
export function pathnameHasLocale(pathname: string): boolean {
  return LOCALE_PATH_REGEX.test(pathname)
}

/**
 * Removes locale from pathname
 * @param pathname - URL pathname with locale
 * @returns Pathname without locale prefix
 * @example removeLocaleFromPathname("/en/browse-tasks") → "/browse-tasks"
 */
export function removeLocaleFromPathname(pathname: string): string {
  if (!pathnameHasLocale(pathname)) return pathname
  
  const segments = pathname.split('/').filter(Boolean)
  const pathWithoutLocale = segments.slice(1).join('/')
  
  return pathWithoutLocale ? `/${pathWithoutLocale}` : ''
}

/**
 * Adds locale prefix to pathname
 * @param pathname - URL pathname without locale
 * @param locale - Locale to add
 * @returns Pathname with locale prefix
 * @example addLocaleToPathname("/browse-tasks", "bg") → "/bg/browse-tasks"
 */
export function addLocaleToPathname(pathname: string, locale: SupportedLocale): string {
  const cleanPath = removeLocaleFromPathname(pathname)
  return `/${locale}${cleanPath}`
}

/**
 * Replaces locale in pathname with a new one
 * @param pathname - URL pathname with existing locale
 * @param newLocale - New locale to use
 * @returns Pathname with updated locale
 * @example replaceLocaleInPathname("/en/browse-tasks", "bg") → "/bg/browse-tasks"
 */
export function replaceLocaleInPathname(pathname: string, newLocale: SupportedLocale): string {
  const pathWithoutLocale = removeLocaleFromPathname(pathname)
  return addLocaleToPathname(pathWithoutLocale, newLocale)
}