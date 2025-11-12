/**
 * Professionals API Route
 * GET /api/professionals - Search and list professionals
 *
 * Query Parameters:
 * - featured: 'true' - Get high-quality featured professionals (20 with diversity)
 * - category: Service category slug (e.g., 'plumbing', 'house-cleaning')
 * - city: City filter
 * - neighborhood: Neighborhood filter (optional)
 * - minRating: Minimum rating (1-5)
 * - verified: Show only verified professionals (phone OR email)
 * - mostActive: Show only very active professionals (50+ completed jobs)
 * - sortBy: 'featured' | 'rating' | 'jobs' | 'newest'
 * - page: Page number (default: 1)
 * - limit: Results per page (default: 20, max: 50)
 *
 * Returns:
 * {
 *   professionals: Professional[],
 *   pagination: {
 *     page: number,
 *     limit: number,
 *     total: number,
 *     totalPages: number,
 *     hasNext: boolean,
 *     hasPrevious: boolean
 *   }
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { ProfessionalService } from '@/server/professionals/professional.service'

/**
 * GET /api/professionals
 * Search and list professionals with filters and pagination
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Parse URL search params
    const { searchParams } = new URL(request.url)

    // Check if this is a featured professionals request
    const isFeaturedRequest = searchParams.get('featured') === 'true'

    // 2. Call service layer
    const professionalService = new ProfessionalService()

    if (isFeaturedRequest) {
      // Handle featured professionals request (ignores all filters)
      const result = await professionalService.getFeaturedProfessionals()

      if (!result.success) {
        return NextResponse.json(
          { error: result.error?.message || 'Failed to fetch featured professionals' },
          { status: 500 }
        )
      }

      // Return featured professionals with simplified pagination
      return NextResponse.json({
        professionals: result.data,
        pagination: {
          page: 1,
          limit: result.data.length,
          total: result.data.length,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false
        }
      }, {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600', // Cache longer for featured
        },
      })
    }

    // Handle regular professionals request with filters
    const params: Record<string, string | undefined> = {
      category: searchParams.get('category') || undefined,
      city: searchParams.get('city') || undefined,
      neighborhood: searchParams.get('neighborhood') || undefined,
      minRating: searchParams.get('minRating') || undefined,
      minJobs: searchParams.get('minJobs') || undefined,
      verified: searchParams.get('verified') || undefined,
      mostActive: searchParams.get('mostActive') || undefined,
      sortBy: searchParams.get('sortBy') || undefined,
      page: searchParams.get('page') || undefined,
      limit: searchParams.get('limit') || undefined,
    }

    const result = await professionalService.getProfessionals(params)

    // 3. Handle errors
    if (!result.success) {
      const error = result.error

      // Check if it's a validation error (400) or server error (500)
      const isValidationError = error.message.includes('Invalid query parameters')
      const statusCode = isValidationError ? 400 : 500

      return NextResponse.json(
        {
          error: error.message,
          ...(process.env.NODE_ENV === 'development' && {
            details: error.stack,
          }),
        },
        { status: statusCode }
      )
    }

    // 4. Return success response
    return NextResponse.json(result.data, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    })
  } catch (error) {
    // Catch-all error handler
    console.error('❌ Professionals API route error:', error)

    return NextResponse.json(
      {
        error: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && {
          details: error instanceof Error ? error.message : 'Unknown error',
        }),
      },
      { status: 500 }
    )
  }
}
