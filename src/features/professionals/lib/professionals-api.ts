/**
 * Professionals API Client
 * Frontend client for fetching professional listings
 */

import type { PaginatedProfessionalsResponse } from '@/server/professionals/professional.types'

/**
 * Fetch professionals from API
 *
 * @param queryString - URL query string (e.g., "category=plumbing&city=sofia")
 * @returns Paginated professionals response
 * @throws Error if request fails
 */
export async function fetchProfessionals(
  queryString: string
): Promise<PaginatedProfessionalsResponse> {
  const url = `/api/professionals${queryString ? `?${queryString}` : ''}`

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    // Enable Next.js caching with revalidation
    next: {
      revalidate: 60, // Revalidate every 60 seconds
    },
  })

  if (!response.ok) {
    // Try to parse error message from response
    let errorMessage = `Failed to fetch professionals: ${response.status} ${response.statusText}`

    try {
      const errorData = await response.json()
      if (errorData.error) {
        errorMessage = errorData.error
      }
    } catch {
      // Failed to parse error JSON, use default message
    }

    throw new Error(errorMessage)
  }

  const data = await response.json()
  return data
}

/**
 * Fetch a single professional by ID
 * For future use (professional detail page)
 *
 * @param id - Professional user ID
 * @returns Professional data or null if not found
 */
export async function fetchProfessionalById(id: string) {
  const response = await fetch(`/api/professionals/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    next: {
      revalidate: 300, // Revalidate every 5 minutes (less frequently than listings)
    },
  })

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch professional: ${response.status}`)
  }

  return response.json()
}
