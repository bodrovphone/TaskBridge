/**
 * Professional Query Parser
 * Parses and validates URL query parameters for professional search
 */

import type {
  ProfessionalQueryParams,
  ProfessionalSortOption,
} from './professional.query-types'
import {
  DEFAULT_QUERY_PARAMS,
  QUERY_CONSTRAINTS,
  isValidSortOption,
} from './professional.query-types'

/**
 * Parse query parameters from URL search params
 * Validates and sanitizes input, applies defaults
 */
export function parseQueryParams(
  params: Record<string, string | undefined>
): ProfessionalQueryParams {
  const parsed: ProfessionalQueryParams = {}

  // === Category Filter ===
  if (params.category && params.category.trim()) {
    parsed.category = params.category.trim().toLowerCase()
  }

  // === City Filter ===
  if (params.city && params.city.trim()) {
    parsed.city = params.city.trim()
  }

  // === Neighborhood Filter ===
  if (params.neighborhood && params.neighborhood.trim()) {
    parsed.neighborhood = params.neighborhood.trim()
  }

  // === Min Rating Filter ===
  if (params.minRating) {
    const rating = parseFloat(params.minRating)
    if (
      !isNaN(rating) &&
      rating >= QUERY_CONSTRAINTS.minRating &&
      rating <= QUERY_CONSTRAINTS.maxRating
    ) {
      parsed.minRating = rating
    }
  }

  // === Min Jobs Filter ===
  if (params.minJobs) {
    const jobs = parseInt(params.minJobs, 10)
    if (!isNaN(jobs) && jobs >= 0) {
      parsed.minJobs = jobs
    }
  }

  // === Verified Filter ===
  if (params.verified !== undefined) {
    parsed.verified = params.verified === 'true' || params.verified === '1'
  }

  // === Most Active Filter ===
  if (params.mostActive !== undefined) {
    parsed.mostActive = params.mostActive === 'true' || params.mostActive === '1'
  }

  // === Sort By ===
  if (params.sortBy && isValidSortOption(params.sortBy)) {
    parsed.sortBy = params.sortBy as ProfessionalSortOption
  } else {
    parsed.sortBy = DEFAULT_QUERY_PARAMS.sortBy
  }

  // === Pagination ===
  // Page (1-indexed for user, 0-indexed for database)
  let page = parseInt(params.page || String(DEFAULT_QUERY_PARAMS.page), 10)
  if (isNaN(page) || page < QUERY_CONSTRAINTS.minPage) {
    page = DEFAULT_QUERY_PARAMS.page
  }
  if (page > QUERY_CONSTRAINTS.maxPage) {
    page = QUERY_CONSTRAINTS.maxPage
  }
  parsed.page = page
  parsed._parsedPage = page - 1 // Convert to 0-indexed for Supabase

  // Limit (results per page)
  let limit = parseInt(params.limit || String(DEFAULT_QUERY_PARAMS.limit), 10)
  if (isNaN(limit) || limit < QUERY_CONSTRAINTS.minLimit) {
    limit = QUERY_CONSTRAINTS.defaultLimit
  }
  if (limit > QUERY_CONSTRAINTS.maxLimit) {
    limit = QUERY_CONSTRAINTS.maxLimit
  }
  parsed.limit = limit
  parsed._parsedLimit = limit

  return parsed
}

/**
 * Validate parsed query parameters
 * Returns array of validation errors (empty if valid)
 */
export function validateQueryParams(
  params: ProfessionalQueryParams
): string[] {
  const errors: string[] = []

  // Validate category (if provided)
  if (params.category && params.category.length > 100) {
    errors.push('Category name is too long (max 100 characters)')
  }

  // Validate city (if provided)
  if (params.city && params.city.length > 100) {
    errors.push('City name is too long (max 100 characters)')
  }

  // Validate neighborhood (if provided)
  if (params.neighborhood && params.neighborhood.length > 100) {
    errors.push('Neighborhood name is too long (max 100 characters)')
  }

  // Validate minRating
  if (
    params.minRating !== undefined &&
    (params.minRating < QUERY_CONSTRAINTS.minRating ||
      params.minRating > QUERY_CONSTRAINTS.maxRating)
  ) {
    errors.push(
      `minRating must be between ${QUERY_CONSTRAINTS.minRating} and ${QUERY_CONSTRAINTS.maxRating}`
    )
  }

  // Validate page
  if (
    params.page !== undefined &&
    (params.page < QUERY_CONSTRAINTS.minPage ||
      params.page > QUERY_CONSTRAINTS.maxPage)
  ) {
    errors.push(
      `page must be between ${QUERY_CONSTRAINTS.minPage} and ${QUERY_CONSTRAINTS.maxPage}`
    )
  }

  // Validate limit
  if (
    params.limit !== undefined &&
    (params.limit < QUERY_CONSTRAINTS.minLimit ||
      params.limit > QUERY_CONSTRAINTS.maxLimit)
  ) {
    errors.push(
      `limit must be between ${QUERY_CONSTRAINTS.minLimit} and ${QUERY_CONSTRAINTS.maxLimit}`
    )
  }

  return errors
}

/**
 * Build a query string from query parameters (for logging/debugging)
 */
export function stringifyQueryParams(params: ProfessionalQueryParams): string {
  const parts: string[] = []

  if (params.category) parts.push(`category=${params.category}`)
  if (params.city) parts.push(`city=${params.city}`)
  if (params.neighborhood) parts.push(`neighborhood=${params.neighborhood}`)
  if (params.minRating) parts.push(`minRating=${params.minRating}`)
  if (params.verified) parts.push(`verified=${params.verified}`)
  if (params.mostActive) parts.push(`mostActive=${params.mostActive}`)
  if (params.sortBy) parts.push(`sortBy=${params.sortBy}`)
  if (params.page) parts.push(`page=${params.page}`)
  if (params.limit) parts.push(`limit=${params.limit}`)

  return parts.join('&')
}
