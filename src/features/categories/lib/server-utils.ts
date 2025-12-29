/**
 * Server-side category utilities
 * For use in repositories and server components where react-i18next is not available
 */

import { MAIN_CATEGORIES } from './main-categories'
import { SUBCATEGORIES } from './subcategories'

// Import translations directly
import { categories as categoriesBg } from '@/lib/intl/bg/categories'
import { categories as categoriesEn } from '@/lib/intl/en/categories'
import { categories as categoriesRu } from '@/lib/intl/ru/categories'

type Locale = 'bg' | 'en' | 'ru'

const translations: Record<Locale, Record<string, string>> = {
  bg: categoriesBg,
  en: categoriesEn,
  ru: categoriesRu,
}

/**
 * Get category label by slug for a specific locale (server-side)
 * Used for slug generation where we need translated category names
 *
 * @param slug - Category slug (e.g., 'appliance-repair', 'plumber')
 * @param locale - Target locale for translation (defaults to 'bg')
 * @returns Translated category label or the slug if not found
 */
export function getCategoryLabelForSlug(slug: string, locale: Locale = 'bg'): string {
  const localeTranslations = translations[locale] || translations.bg

  // First check subcategories
  const subcategory = SUBCATEGORIES.find(cat => cat.slug === slug)
  if (subcategory) {
    return localeTranslations[subcategory.translationKey] || slug
  }

  // Then check main categories
  const mainCategory = MAIN_CATEGORIES.find(cat => cat.slug === slug)
  if (mainCategory) {
    const titleKey = `${mainCategory.translationKey}.title`
    return localeTranslations[titleKey] || slug
  }

  // Fallback to slug
  return slug
}
