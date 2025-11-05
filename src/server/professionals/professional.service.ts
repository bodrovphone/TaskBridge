/**
 * Professional Service
 * Business logic layer for professional operations
 * Orchestrates repository, privacy filtering, and error handling
 */

import type {
  PaginatedProfessionalsResponse,
  Professional,
} from './professional.types'
import type { ProfessionalQueryParams } from './professional.query-types'
import { getProfessionals as getProfessionalsFromRepo } from './professional.repository'
import { filterSensitiveFieldsBatch, warnIfSensitiveFields } from './professional.privacy'
import { parseQueryParams, validateQueryParams } from './professional.query-parser'

/**
 * Service response wrapper
 * Standardized success/error response format
 */
export type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; error: Error }

/**
 * Professional Service Class
 * Main entry point for professional operations
 */
export class ProfessionalService {
  /**
   * Get professionals with filters, sorting, and pagination
   *
   * @param rawParams - Raw query parameters from URL
   * @returns Paginated list of professionals (privacy-filtered)
   */
  async getProfessionals(
    rawParams: Record<string, string | undefined>
  ): Promise<ServiceResult<PaginatedProfessionalsResponse>> {
    try {
      // 1. Parse and validate query parameters
      const params = parseQueryParams(rawParams)
      const validationErrors = validateQueryParams(params)

      if (validationErrors.length > 0) {
        return {
          success: false,
          error: new Error(`Invalid query parameters: ${validationErrors.join(', ')}`),
        }
      }

      // 2. Log query for debugging (development only)
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Professional search query:', {
          category: params.category,
          city: params.city,
          minRating: params.minRating,
          verified: params.verified,
          mostActive: params.mostActive,
          sortBy: params.sortBy,
          page: params.page,
          limit: params.limit,
        })
      }

      // 3. Fetch professionals from repository
      const result = await getProfessionalsFromRepo(params)

      // 4. Filter sensitive fields for privacy
      const filteredProfessionals = filterSensitiveFieldsBatch(
        result.professionals as any
      )

      // 5. Validate no sensitive fields leaked (development only)
      warnIfSensitiveFields(filteredProfessionals, 'getProfessionals response')

      // 6. Return success response
      const response: PaginatedProfessionalsResponse = {
        professionals: filteredProfessionals,
        pagination: result.pagination,
      }

      // Log result counts (development only)
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Found professionals:', {
          count: filteredProfessionals.length,
          total: result.pagination.total,
          page: result.pagination.page,
          totalPages: result.pagination.totalPages,
        })
      }

      return {
        success: true,
        data: response,
      }
    } catch (error) {
      // Log error for debugging
      console.error('❌ Professional service error:', error)

      return {
        success: false,
        error: error instanceof Error ? error : new Error('Unknown error occurred'),
      }
    }
  }

  /**
   * Get a single professional by ID
   * For future use (professional detail page)
   *
   * @param id - Professional user ID
   * @returns Professional data (privacy-filtered)
   */
  async getProfessionalById(
    id: string
  ): Promise<ServiceResult<Professional | null>> {
    try {
      // Import here to avoid circular dependency
      const { getProfessionalById: getById } = await import(
        './professional.repository'
      )

      const professional = await getById(id)

      if (!professional) {
        return {
          success: true,
          data: null,
        }
      }

      // Filter sensitive fields
      const { filterSensitiveFields } = await import('./professional.privacy')
      const { calculateFeaturedStatus } = await import('./professional.types')

      const filtered = filterSensitiveFields({
        ...professional,
        featured: calculateFeaturedStatus(professional),
      })

      return {
        success: true,
        data: filtered,
      }
    } catch (error) {
      console.error('❌ Get professional by ID error:', error)

      return {
        success: false,
        error:
          error instanceof Error ? error : new Error('Unknown error occurred'),
      }
    }
  }
}

/**
 * Export singleton instance
 */
export const professionalService = new ProfessionalService()
