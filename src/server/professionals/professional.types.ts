/**
 * Professional Types
 * Type definitions for professional data and responses
 */

/**
 * Professional data shape returned by API
 * Mirrors database schema but only includes public-safe fields
 */
export interface Professional {
  id: string
  slug: string | null // URL-friendly identifier (e.g., "ivan-petrov-plumber")
  full_name: string | null
  professional_title: string
  avatar_url: string | null
  bio: string | null

  // Service info
  service_categories: string[]
  years_experience: number | null
  hourly_rate_bgn: number | null
  company_name: string | null

  // Location (city only, neighborhood hidden for privacy)
  city: string | null

  // Statistics (auto-calculated)
  tasks_completed: number
  average_rating: number | null
  total_reviews: number

  // Verification status (boolean only, not actual contact info)
  is_phone_verified: boolean
  is_email_verified: boolean
  is_vat_verified: boolean

  // Featured status (calculated based on rating + activity)
  featured: boolean

  // Badge fields
  is_early_adopter: boolean
  early_adopter_categories: string[]
  is_top_professional: boolean
  top_professional_until: string | null
  top_professional_tasks_count: number
  is_featured: boolean

  // Timestamps
  created_at: string
}

/**
 * Raw professional data from database (before privacy filtering)
 * Includes all fields from users table
 */
export interface ProfessionalRaw {
  id: string
  slug: string | null // URL-friendly identifier
  created_at: string
  updated_at: string

  // Basic Info
  email: string | null
  phone: string | null
  full_name: string | null
  avatar_url: string | null

  // Profile
  city: string | null
  bio: string | null

  // Professional fields
  professional_title: string | null
  vat_number: string | null
  is_vat_verified: boolean
  company_name: string | null
  years_experience: number | null
  hourly_rate_bgn: number | null
  service_categories: string[]

  // Statistics
  tasks_completed: number
  average_rating: number | null
  total_reviews: number
  response_time_hours: number | null

  // Verification
  is_phone_verified: boolean
  is_email_verified: boolean

  // Badge fields
  is_early_adopter: boolean
  early_adopter_categories: string[]
  is_top_professional: boolean
  top_professional_until: string | null
  top_professional_tasks_count: number
  is_featured: boolean
  featured_until: string | null

  // Settings (should be filtered out)
  notification_preferences: any
  privacy_settings: any

  // Metadata (some should be filtered)
  last_active_at: string | null
  is_banned: boolean
}

/**
 * Paginated response for professional listings
 */
export interface PaginatedProfessionalsResponse {
  professionals: Professional[]
  featuredProfessionals: Professional[] // Always returned - ignores user filters
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrevious: boolean
  }
}

/**
 * Featured status calculation criteria
 */
export interface FeaturedCriteria {
  minRating: number          // Default: 4.8
  minReviews: number         // Default: 10
  minTasksCompleted: number  // Default: 100
  vatVerified: boolean       // Verified professionals get featured
}

/**
 * Default featured criteria
 */
export const DEFAULT_FEATURED_CRITERIA: FeaturedCriteria = {
  minRating: 4.8,
  minReviews: 10,
  minTasksCompleted: 100,
  vatVerified: true,
}

/**
 * Completed task item for professional detail page
 */
export interface CompletedTaskItem {
  id: string
  title: string
  categorySlug: string
  citySlug: string | null
  neighborhood: string | null
  completedDate: string | null
  clientRating: number
  budget: number
  durationHours: number
  clientName: string
  clientAvatar: string | null
  testimonial?: string
  isVerified: boolean
  complexity: 'Simple' | 'Standard' | 'Complex'
}

/**
 * Review item for professional detail page
 */
export interface ReviewItem {
  id: string
  clientName: string
  clientAvatar: string | null
  rating: number
  comment: string
  date: string
  verified: boolean
  anonymous: boolean
  communicationRating?: number
  qualityRating?: number
  professionalismRating?: number
  timelinessRating?: number
}

/**
 * Professional detail response (extended data for detail page)
 */
export interface ProfessionalDetail extends Professional {
  // Extended profile data
  services: string[]
  portfolio: any[]
  responseTimeHours: number | null

  // Safety & verification
  safetyStatus: {
    phoneVerified: boolean
    profileComplete: boolean
    policeCertificate: boolean
    backgroundCheckPassed: boolean
  }

  // Contact settings
  contactSettings: {
    allowDirectContact: boolean
    preferredHours: string
    contactMethods: string[]
  }

  // Related data
  completedTasksList: CompletedTaskItem[]
  reviews: ReviewItem[]
}

/**
 * Helper to determine if professional should be featured
 */
export function calculateFeaturedStatus(
  professional: Pick<ProfessionalRaw, 'average_rating' | 'total_reviews' | 'tasks_completed' | 'is_vat_verified'>,
  criteria: FeaturedCriteria = DEFAULT_FEATURED_CRITERIA
): boolean {
  // VAT verified professionals are always featured
  if (professional.is_vat_verified) {
    return true
  }

  // High rating + many reviews = featured
  if (
    professional.average_rating !== null &&
    professional.average_rating >= criteria.minRating &&
    professional.total_reviews >= criteria.minReviews
  ) {
    return true
  }

  // Very active professionals are featured
  if (professional.tasks_completed >= criteria.minTasksCompleted) {
    return true
  }

  return false
}
