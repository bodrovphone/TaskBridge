/**
 * Translation Service
 *
 * Provides one-way translation TO Bulgarian for task content.
 * Uses DeepL API with quota management.
 *
 * Quota Logic:
 * 1. Before translating, check if quota_exceeded_at exists in DB and is < 30 days old
 * 2. If quota exceeded, skip translation (graceful degradation)
 * 3. On 456 error from DeepL, store quota_exceeded_at timestamp in DB
 *
 * Graceful degradation: If translation fails, returns null (original text used)
 */

import { createAdminClient } from '@/lib/supabase/server'

// ============================================================================
// Types
// ============================================================================

export interface TranslateTaskInput {
  title: string
  description: string
  requirements?: string | null
  sourceLocale: string
}

export interface TranslateTaskOutput {
  title_bg: string | null
  description_bg: string | null
  requirements_bg: string | null
}

export interface TranslateProfessionalProfileInput {
  professionalTitle?: string | null
  bio?: string | null
  services?: Array<{
    id: string
    name: string
    price: string
    description?: string  // Optional - not used in MVP
    order: number
  }> | null
  sourceLocale: string
}

export interface TranslateProfessionalProfileOutput {
  professional_title_bg: string | null
  bio_bg: string | null
  services_bg: Array<{
    id: string
    name: string
    price: string
    description?: string  // Optional - not used in MVP
    order: number
  }> | null
  content_source_language: string
}

interface DeepLTranslation {
  detected_source_language: string
  text: string
}

interface DeepLResponse {
  translations: DeepLTranslation[]
}

interface DeepLUsageResponse {
  character_count: number
  character_limit: number
}

// ============================================================================
// Quota Management (Database)
// ============================================================================

const QUOTA_SETTING_KEY = 'deepl_quota_exceeded_at'
const QUOTA_COOLDOWN_DAYS = 30

/**
 * Check if DeepL quota is currently exceeded
 * Returns true if we should skip translation
 */
async function isQuotaExceeded(): Promise<boolean> {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', QUOTA_SETTING_KEY)
      .single()

    if (error || !data?.value) {
      // No record = quota not exceeded
      return false
    }

    const exceededAt = new Date(data.value)
    const now = new Date()
    const daysSinceExceeded = (now.getTime() - exceededAt.getTime()) / (1000 * 60 * 60 * 24)

    if (daysSinceExceeded < QUOTA_COOLDOWN_DAYS) {
      console.log('[Translation] DeepL quota exceeded, skipping translation. Days remaining:',
        Math.ceil(QUOTA_COOLDOWN_DAYS - daysSinceExceeded))
      return true
    }

    // Cooldown period passed, clear the flag
    await clearQuotaExceeded()
    return false
  } catch (error) {
    console.error('[Translation] Error checking quota status:', error)
    // On error, assume quota is OK (fail-open)
    return false
  }
}

/**
 * Mark quota as exceeded in database
 */
async function markQuotaExceeded(): Promise<void> {
  try {
    const supabase = createAdminClient()
    const now = new Date().toISOString()

    // Upsert the setting
    const { error } = await supabase
      .from('app_settings')
      .upsert({
        key: QUOTA_SETTING_KEY,
        value: now,
        updated_at: now
      }, {
        onConflict: 'key'
      })

    if (error) {
      console.error('[Translation] Failed to save quota exceeded status:', error)
    } else {
      console.warn('[Translation] DeepL quota exceeded - marked in database. Will skip translations for 30 days.')
    }
  } catch (error) {
    console.error('[Translation] Error marking quota exceeded:', error)
  }
}

/**
 * Clear quota exceeded flag (after cooldown period)
 */
async function clearQuotaExceeded(): Promise<void> {
  try {
    const supabase = createAdminClient()

    await supabase
      .from('app_settings')
      .delete()
      .eq('key', QUOTA_SETTING_KEY)

    console.log('[Translation] Quota cooldown period passed, cleared exceeded flag')
  } catch (error) {
    console.error('[Translation] Error clearing quota exceeded:', error)
  }
}

// ============================================================================
// DeepL API Functions
// ============================================================================

/**
 * Get DeepL API base URL based on API key type
 */
function getDeepLBaseUrl(apiKey: string): string {
  const isFreeApi = apiKey.endsWith(':fx')
  return isFreeApi
    ? 'https://api-free.deepl.com/v2'
    : 'https://api.deepl.com/v2'
}

/**
 * Map our locale codes to DeepL source language codes
 */
function mapToDeepLSourceLang(locale: string): string {
  const mapping: Record<string, string> = {
    en: 'EN',
    ru: 'RU',
    ua: 'UK', // Ukrainian in DeepL is 'UK'
    uk: 'UK',
  }
  return mapping[locale.toLowerCase()] || 'EN'
}

/**
 * Check DeepL usage/quota
 * Returns { used, limit, percentUsed } or null on error
 */
export async function checkDeepLUsage(): Promise<{
  used: number
  limit: number
  percentUsed: number
} | null> {
  const apiKey = process.env.DEEPL_API_KEY
  if (!apiKey) return null

  try {
    const baseUrl = getDeepLBaseUrl(apiKey)
    const response = await fetch(`${baseUrl}/usage`, {
      headers: {
        Authorization: `DeepL-Auth-Key ${apiKey}`,
      },
    })

    if (!response.ok) {
      console.error('[Translation] Failed to check DeepL usage:', response.status)
      return null
    }

    const data: DeepLUsageResponse = await response.json()
    return {
      used: data.character_count,
      limit: data.character_limit,
      percentUsed: Math.round((data.character_count / data.character_limit) * 100),
    }
  } catch (error) {
    console.error('[Translation] Error checking DeepL usage:', error)
    return null
  }
}

/**
 * Translate text using DeepL API
 */
async function translateWithDeepL(
  text: string,
  sourceLang: string
): Promise<string | null> {
  const apiKey = process.env.DEEPL_API_KEY

  if (!apiKey) {
    console.error('[Translation] DEEPL_API_KEY not configured')
    return null
  }

  const baseUrl = getDeepLBaseUrl(apiKey)

  try {
    const response = await fetch(`${baseUrl}/translate`, {
      method: 'POST',
      headers: {
        Authorization: `DeepL-Auth-Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: [text],
        source_lang: mapToDeepLSourceLang(sourceLang),
        target_lang: 'BG',
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text()

      // Check for quota exceeded (456 status code or quota in error message)
      if (response.status === 456 || errorBody.toLowerCase().includes('quota')) {
        console.warn('[Translation] DeepL quota exceeded (status:', response.status, ')')
        await markQuotaExceeded()
        return null
      }

      console.error('[Translation] DeepL API error:', {
        status: response.status,
        body: errorBody,
      })
      return null
    }

    const data: DeepLResponse = await response.json()

    if (data.translations && data.translations.length > 0) {
      return data.translations[0].text
    }

    return null
  } catch (error) {
    console.error('[Translation] DeepL request failed:', error)
    return null
  }
}

// ============================================================================
// Main Translation Function
// ============================================================================

/**
 * Translate a single text to Bulgarian
 */
async function translateToBulgarian(
  text: string,
  sourceLang: string
): Promise<string | null> {
  if (!text || text.trim().length === 0) {
    return null
  }

  return translateWithDeepL(text, sourceLang)
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Translate task content to Bulgarian
 *
 * Flow:
 * 1. Check if quota exceeded (from DB) - if yes, skip
 * 2. Translate all fields in parallel
 * 3. If 456 error, mark quota exceeded in DB
 * 4. Return translations (or nulls for graceful degradation)
 */
export async function translateTaskToBulgarian(
  input: TranslateTaskInput
): Promise<TranslateTaskOutput> {
  const { title, description, requirements, sourceLocale } = input

  // No translation needed for Bulgarian source
  if (sourceLocale === 'bg') {
    return {
      title_bg: null,
      description_bg: null,
      requirements_bg: null,
    }
  }

  // Check if quota is exceeded (skip if true)
  const quotaExceeded = await isQuotaExceeded()
  if (quotaExceeded) {
    console.log('[Translation] Skipping translation - quota exceeded')
    return {
      title_bg: null,
      description_bg: null,
      requirements_bg: null,
    }
  }

  // Calculate total characters for logging
  const totalChars =
    title.length + description.length + (requirements?.length || 0)

  console.log('[Translation] Starting task translation:', {
    sourceLocale,
    totalChars,
    fields: {
      title: title.length,
      description: description.length,
      requirements: requirements?.length || 0,
    },
  })

  // Translate all fields in parallel
  const [title_bg, description_bg, requirements_bg] = await Promise.all([
    translateToBulgarian(title, sourceLocale),
    translateToBulgarian(description, sourceLocale),
    requirements ? translateToBulgarian(requirements, sourceLocale) : Promise.resolve(null),
  ])

  // Log results for cost tracking
  const successCount = [title_bg, description_bg, requirements_bg].filter(Boolean).length
  console.log('[Translation] Completed:', {
    sourceLocale,
    charsTranslated: totalChars,
    fieldsTranslated: successCount,
    success: successCount > 0,
  })

  return {
    title_bg,
    description_bg,
    requirements_bg,
  }
}

/**
 * Check if translation service is configured
 */
export function isTranslationConfigured(): boolean {
  return Boolean(process.env.DEEPL_API_KEY)
}

// ============================================================================
// Professional Profile Translation
// ============================================================================

/**
 * Translate professional profile content to Bulgarian
 *
 * Translates: professionalTitle, bio, services (name, description)
 * Note: services.price is NOT translated (contains currency/numbers)
 *
 * Flow:
 * 1. Check if quota exceeded - if yes, skip
 * 2. Translate all text fields in parallel
 * 3. Return translations (or nulls for graceful degradation)
 */
export async function translateProfessionalProfileToBulgarian(
  input: TranslateProfessionalProfileInput
): Promise<TranslateProfessionalProfileOutput> {
  const { professionalTitle, bio, services, sourceLocale } = input

  // No translation needed for Bulgarian source
  if (sourceLocale === 'bg') {
    return {
      professional_title_bg: null,
      bio_bg: null,
      services_bg: null,
      content_source_language: 'bg',
    }
  }

  // Check if quota is exceeded (skip if true)
  const quotaExceeded = await isQuotaExceeded()
  if (quotaExceeded) {
    console.log('[Translation] Skipping profile translation - quota exceeded')
    return {
      professional_title_bg: null,
      bio_bg: null,
      services_bg: null,
      content_source_language: sourceLocale,
    }
  }

  // Calculate total characters for logging
  const servicesTextLength = services?.reduce((sum, s) =>
    sum + (s.name?.length || 0) + (s.description?.length || 0), 0) || 0
  const totalChars =
    (professionalTitle?.length || 0) +
    (bio?.length || 0) +
    servicesTextLength

  console.log('[Translation] Starting professional profile translation:', {
    sourceLocale,
    totalChars,
    fields: {
      professionalTitle: professionalTitle?.length || 0,
      bio: bio?.length || 0,
      servicesCount: services?.length || 0,
      servicesTextLength,
    },
  })

  // Translate main text fields in parallel
  const [professional_title_bg, bio_bg] = await Promise.all([
    professionalTitle ? translateToBulgarian(professionalTitle, sourceLocale) : Promise.resolve(null),
    bio ? translateToBulgarian(bio, sourceLocale) : Promise.resolve(null),
  ])

  // Translate services if present
  let services_bg: TranslateProfessionalProfileOutput['services_bg'] = null

  if (services && services.length > 0) {
    // Translate all service names and descriptions in parallel
    const serviceTranslations = await Promise.all(
      services.map(async (service) => {
        const [translatedName, translatedDescription] = await Promise.all([
          service.name ? translateToBulgarian(service.name, sourceLocale) : Promise.resolve(null),
          service.description ? translateToBulgarian(service.description, sourceLocale) : Promise.resolve(null),
        ])

        return {
          id: service.id,
          name: translatedName || service.name, // Fallback to original if translation fails
          price: service.price, // Don't translate prices
          description: translatedDescription || service.description,
          order: service.order,
        }
      })
    )

    services_bg = serviceTranslations
  }

  // Log results for cost tracking
  const successCount = [professional_title_bg, bio_bg, services_bg].filter(Boolean).length
  console.log('[Translation] Professional profile completed:', {
    sourceLocale,
    charsTranslated: totalChars,
    fieldsTranslated: successCount,
    servicesTranslated: services_bg?.length || 0,
    success: successCount > 0,
  })

  return {
    professional_title_bg,
    bio_bg,
    services_bg,
    content_source_language: sourceLocale,
  }
}
