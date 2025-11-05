/**
 * Professional Query Types
 * Type definitions for API query parameters and filters
 */

/**
 * Sort options for professional listings
 */
export type ProfessionalSortOption =
  | 'featured'     // Featured professionals first (high rating, VAT verified, very active)
  | 'rating'       // Highest rated first
  | 'jobs'         // Most completed jobs first
  | 'newest'       // Recently joined professionals first

/**
 * Professional query parameters
 * Used for filtering and sorting professional listings
 */
export interface ProfessionalQueryParams {
  // Search & Filter
  category?: string          // Service category slug (e.g., 'plumbing', 'house-cleaning')
  city?: string             // City filter
  neighborhood?: string     // Neighborhood filter (optional)
  minRating?: number        // Minimum rating (1-5)
  minJobs?: number          // Minimum completed jobs

  // Special filters
  verified?: boolean        // Show only verified professionals (phone OR email)
  mostActive?: boolean      // Show only very active professionals (tasks_completed > 50)

  // Sorting
  sortBy?: ProfessionalSortOption

  // Pagination
  page?: number             // Page number (1-indexed)
  limit?: number            // Results per page

  // Internal (not exposed in API)
  _parsedPage?: number      // 0-indexed page for Supabase
  _parsedLimit?: number     // Validated limit
}

/**
 * Default query parameter values
 */
export const DEFAULT_QUERY_PARAMS: Required<
  Pick<ProfessionalQueryParams, 'sortBy' | 'page' | 'limit'>
> = {
  sortBy: 'featured',
  page: 1,
  limit: 20,
}

/**
 * Query parameter constraints
 */
export const QUERY_CONSTRAINTS = {
  minPage: 1,
  maxPage: 1000,
  minLimit: 1,
  maxLimit: 50,
  defaultLimit: 20,
  minRating: 1,
  maxRating: 5,
  mostActiveThreshold: 50, // Minimum completed jobs for "most active" filter
} as const

/**
 * Valid sort options (for validation)
 */
export const VALID_SORT_OPTIONS: readonly ProfessionalSortOption[] = [
  'featured',
  'rating',
  'jobs',
  'newest',
] as const

/**
 * Type guard to check if sort option is valid
 */
export function isValidSortOption(value: any): value is ProfessionalSortOption {
  return VALID_SORT_OPTIONS.includes(value as ProfessionalSortOption)
}
