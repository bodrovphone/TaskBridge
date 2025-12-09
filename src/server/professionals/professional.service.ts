/**
 * Professional Service
 * Business logic layer for professional operations
 * Orchestrates repository, privacy filtering, and error handling
 */

import type {
  PaginatedProfessionalsResponse,
  Professional,
  ProfessionalDetail,
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

      // 2. Fetch professionals from repository
      const result = await getProfessionalsFromRepo(params)

      // 3. Filter sensitive fields for privacy (both main results and featured)
      const filteredProfessionals = filterSensitiveFieldsBatch(
        result.professionals as any
      )
      const filteredFeaturedProfessionals = filterSensitiveFieldsBatch(
        result.featuredProfessionals as any
      )

      // 4. Validate no sensitive fields leaked (development only)
      warnIfSensitiveFields(filteredProfessionals, 'getProfessionals response')
      warnIfSensitiveFields(filteredFeaturedProfessionals, 'getFeaturedProfessionals response')

      // 5. Return success response
      const response: PaginatedProfessionalsResponse = {
        professionals: filteredProfessionals,
        featuredProfessionals: filteredFeaturedProfessionals,
        pagination: result.pagination,
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
   * Get featured professionals (high-quality, diverse selection)
   * Ignores all filters and returns top 20 professionals based on quality scoring
   *
   * @returns List of featured professionals (privacy-filtered)
   */
  async getFeaturedProfessionals(): Promise<ServiceResult<Professional[]>> {
    try {
      // Import repository function
      const { getFeaturedProfessionals: getFeaturedFromRepo } = await import(
        './professional.repository'
      )

      // Get featured professionals
      const featuredProfessionals = await getFeaturedFromRepo(20)

      // Filter sensitive fields
      const { filterSensitiveFieldsBatch } = await import('./professional.privacy')
      const filtered = filterSensitiveFieldsBatch(featuredProfessionals as any)

      // Validate no sensitive fields leaked
      warnIfSensitiveFields(filtered, 'getFeaturedProfessionals response')

      return {
        success: true,
        data: filtered,
      }
    } catch (error) {
      console.error('❌ Get featured professionals error:', error)

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

  /**
   * Get professional detail by ID with completed tasks and reviews
   * Optimized for detail page - fetches all related data in parallel
   *
   * @param id - Professional user ID
   * @param lang - Language for date formatting (bg, en, ru)
   * @returns Full professional detail (already filtered by repository)
   */
  async getProfessionalDetail(
    id: string,
    lang: string = 'bg'
  ): Promise<ServiceResult<ProfessionalDetail | null>> {
    try {
      const { getProfessionalDetailById } = await import(
        './professional.repository'
      )

      const detail = await getProfessionalDetailById(id, lang)

      if (!detail) {
        return {
          success: true,
          data: null,
        }
      }

      // Note: ProfessionalDetail doesn't include sensitive fields by design
      // The repository only returns public-safe data

      return {
        success: true,
        data: detail,
      }
    } catch (error) {
      console.error('❌ Get professional detail error:', error)

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
