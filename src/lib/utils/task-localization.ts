/**
 * Task Localization Utility
 *
 * Handles display of task content based on viewer's locale.
 * Implements one-way translation display logic:
 * - BG locale viewers see Bulgarian translations (if available)
 * - All other locale viewers see original text
 */

import type { Task } from '@/server/tasks/task.types'

/**
 * Localized task content for display
 */
export interface LocalizedTaskContent {
  title: string
  description: string
  requirements: string | null
  /** True if content is translated (not original) */
  isTranslated: boolean
  /** Original language the task was written in */
  sourceLanguage: string
}

/**
 * Get localized task content based on viewer's locale
 *
 * Display logic:
 * - BG locale + non-BG source + translation exists → Bulgarian translation
 * - BG locale + non-BG source + NO translation → original (graceful degradation)
 * - BG locale + BG source → original (no translation needed)
 * - Other locales → original text always
 *
 * @param task - Task with translation fields
 * @param viewerLocale - Current user's locale (en, bg, ru, ua)
 * @returns Localized content with metadata
 */
export function getLocalizedTaskContent(
  task: Task,
  viewerLocale: string
): LocalizedTaskContent {
  const sourceLanguage = task.source_language || 'bg'

  // Only BG locale viewers see translations
  if (viewerLocale === 'bg' && sourceLanguage !== 'bg') {
    // Use Bulgarian translation if available, otherwise graceful degradation to original
    const hasTranslation = Boolean(task.title_bg || task.description_bg)

    return {
      title: task.title_bg || task.title,
      description: task.description_bg || task.description,
      requirements: task.requirements_bg || task.location_notes,
      isTranslated: hasTranslation,
      sourceLanguage,
    }
  }

  // Everyone else sees original
  return {
    title: task.title,
    description: task.description,
    requirements: task.location_notes,
    isTranslated: false,
    sourceLanguage,
  }
}

/**
 * Get human-readable language name for display
 *
 * @param locale - Language code (en, bg, ru, ua)
 * @param displayLocale - Locale to display the name in
 * @returns Human-readable language name
 */
export function getLanguageName(locale: string, displayLocale: string = 'en'): string {
  const names: Record<string, Record<string, string>> = {
    en: {
      en: 'English',
      bg: 'Английски',
      ru: 'Английский',
      ua: 'Англійська',
    },
    bg: {
      en: 'Bulgarian',
      bg: 'Български',
      ru: 'Болгарский',
      ua: 'Болгарська',
    },
    ru: {
      en: 'Russian',
      bg: 'Руски',
      ru: 'Русский',
      ua: 'Російська',
    },
    ua: {
      en: 'Ukrainian',
      bg: 'Украински',
      ru: 'Украинский',
      ua: 'Українська',
    },
  }

  return names[locale]?.[displayLocale] || locale.toUpperCase()
}

/**
 * Check if task needs translation indicator shown
 *
 * @param task - Task with source_language
 * @param viewerLocale - Current user's locale
 * @returns True if we should show "Originally written in X" indicator
 */
export function shouldShowTranslationIndicator(
  task: Task,
  viewerLocale: string
): boolean {
  const sourceLanguage = task.source_language || 'bg'

  // Only show indicator for BG viewers seeing translated content
  return viewerLocale === 'bg' && sourceLanguage !== 'bg'
}
