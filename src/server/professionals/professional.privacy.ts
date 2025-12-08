/**
 * Professional Privacy Filter
 * Filters sensitive fields from professional data before returning to client
 */

import type { Professional, ProfessionalRaw } from './professional.types'

/**
 * Public fields that are safe to expose in professional listings
 * These fields are shown to all users browsing professionals
 */
const PUBLIC_FIELDS: readonly (keyof Professional)[] = [
  'id',
  'full_name',
  'professional_title',
  'avatar_url',
  'bio',
  'service_categories',
  'years_experience',
  'hourly_rate_bgn',
  'company_name',
  'city',
  'tasks_completed',
  'average_rating',
  'total_reviews',
  'is_phone_verified',
  'is_email_verified',
  'is_vat_verified',
  'featured',
  // Badge fields
  'is_early_adopter',
  'early_adopter_categories',
  'is_top_professional',
  'top_professional_until',
  'top_professional_tasks_count',
  'is_featured',
  'created_at',
] as const

/**
 * Private fields that should NEVER be exposed in professional listings
 * These are only shown after a professional is hired for a task
 */
const PRIVATE_FIELDS = [
  'email',             // Actual email address
  'phone',             // Actual phone number
  'neighborhood',      // Too specific for public listing
  'vat_number',        // Business ID number
  'notification_preferences',
  'privacy_settings',
  'preferred_contact',
  'last_active_at',    // Privacy concern
  'response_time_hours', // Internal metric
  'is_banned',         // Internal status
  'ban_reason',        // Internal data
  'banned_at',         // Internal timestamp
  'updated_at',        // Not needed for listings
] as const

/**
 * Filter sensitive fields from professional data
 * Returns only public-safe fields
 */
export function filterSensitiveFields(
  professional: ProfessionalRaw & { featured?: boolean }
): Professional {
  // Start with empty object
  const filtered: any = {}

  // Only copy public fields
  PUBLIC_FIELDS.forEach((field) => {
    if (field in professional) {
      filtered[field] = professional[field as keyof typeof professional]
    }
  })

  // Ensure featured status is set (default to false if not calculated)
  if (!('featured' in filtered)) {
    filtered.featured = false
  }

  return filtered as Professional
}

/**
 * Filter an array of professionals
 */
export function filterSensitiveFieldsBatch(
  professionals: (ProfessionalRaw & { featured?: boolean })[]
): Professional[] {
  return professionals.map(filterSensitiveFields)
}

/**
 * Validate that no sensitive fields are present in the output
 * Used for testing and security audits
 */
export function validateNoSensitiveFields(data: any): boolean {
  if (Array.isArray(data)) {
    return data.every((item) => validateNoSensitiveFields(item))
  }

  if (typeof data === 'object' && data !== null) {
    // Check if any private field exists in the object
    for (const privateField of PRIVATE_FIELDS) {
      if (privateField in data) {
        console.error(`Sensitive field detected in output: ${privateField}`)
        return false
      }
    }

    // Recursively check nested objects
    for (const value of Object.values(data)) {
      if (typeof value === 'object' && value !== null) {
        if (!validateNoSensitiveFields(value)) {
          return false
        }
      }
    }
  }

  return true
}

/**
 * Log warning if sensitive fields are detected
 * Used in development for debugging
 */
export function warnIfSensitiveFields(data: any, context: string = ''): void {
  if (process.env.NODE_ENV === 'development') {
    if (!validateNoSensitiveFields(data)) {
      console.warn(
        `⚠️  PRIVACY WARNING: Sensitive fields detected in ${context || 'response'}`
      )
      console.warn('Please ensure filterSensitiveFields() is called before returning data')
    }
  }
}
