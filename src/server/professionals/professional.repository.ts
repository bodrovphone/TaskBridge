/**
 * Professional Repository
 * Database queries for professional listings
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Use service role to bypass RLS - professional listings are public
const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
import type {
  Professional,
  ProfessionalRaw,
  PaginatedProfessionalsResponse,
} from './professional.types'
import { calculateFeaturedStatus } from './professional.types'
import type { ProfessionalQueryParams } from './professional.query-types'
import { QUERY_CONSTRAINTS } from './professional.query-types'

/**
 * Fetch featured professionals (ignores all user filters)
 * Used as fallback when no results found
 */
async function getFeaturedProfessionals(limit: number = 8): Promise<Professional[]> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .not('professional_title', 'is', null)
    .neq('is_banned', true)
    .order('average_rating', { ascending: false, nullsFirst: false })
    .order('tasks_completed', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Featured professionals query error:', error)
    return []
  }

  const professionalsRaw = (data as ProfessionalRaw[]) || []
  return professionalsRaw.map((prof) => ({
    ...prof,
    featured: calculateFeaturedStatus(prof),
  })) as any
}

/**
 * Fetch professionals from database with filters, sorting, and pagination
 */
export async function getProfessionals(
  params: ProfessionalQueryParams
): Promise<PaginatedProfessionalsResponse> {
  // Build base query - only users with professional_title
  // Note: Using service role to bypass RLS - professional listings are public
  let query = supabaseAdmin
    .from('users')
    .select('*', { count: 'exact' })
    .not('professional_title', 'is', null)

  // === Apply Filters ===

  // Category filter (service_categories contains the specified category)
  if (params.category) {
    query = query.contains('service_categories', [params.category])
  }

  // City filter
  if (params.city) {
    query = query.eq('city', params.city)
  }

  // Neighborhood filter (optional, more specific than city)
  if (params.neighborhood) {
    query = query.eq('neighborhood', params.neighborhood)
  }

  // Min rating filter
  if (params.minRating !== undefined) {
    query = query.gte('average_rating', params.minRating)
  }

  // Min jobs filter
  if (params.minJobs !== undefined) {
    query = query.gte('tasks_completed', params.minJobs)
  }

  // Verified filter (phone OR email verified)
  if (params.verified) {
    query = query.or('is_phone_verified.eq.true,is_email_verified.eq.true')
  }

  // Most active filter (tasks_completed > threshold)
  if (params.mostActive) {
    query = query.gt('tasks_completed', QUERY_CONSTRAINTS.mostActiveThreshold)
  }

  // Exclude banned users - only filter out explicitly banned (true)
  // This allows both null and false through without OR complexity
  query = query.neq('is_banned', true)

  // === Apply Sorting ===
  switch (params.sortBy) {
    case 'rating':
      // Highest rated first, then by review count
      query = query
        .order('average_rating', { ascending: false, nullsFirst: false })
        .order('total_reviews', { ascending: false })
      break

    case 'jobs':
      // Most completed jobs first
      query = query.order('tasks_completed', { ascending: false })
      break

    case 'newest':
      // Recently joined first
      query = query.order('created_at', { ascending: false })
      break

    case 'featured':
    default:
      // Featured algorithm: High rating + VAT verified + very active
      // We'll sort on the client side since "featured" is calculated
      // For now, sort by rating as a fallback
      query = query
        .order('average_rating', { ascending: false, nullsFirst: false })
        .order('tasks_completed', { ascending: false })
      break
  }

  // === Apply Pagination ===
  const page = params._parsedPage ?? 0
  const limit = params._parsedLimit ?? QUERY_CONSTRAINTS.defaultLimit

  query = query.range(page * limit, (page + 1) * limit - 1)

  // === Execute Query ===
  const { data, error, count } = await query

  if (error) {
    console.error('Professional repository error:', error)
    throw new Error(`Failed to fetch professionals: ${error.message}`)
  }

  // === Calculate Featured Status ===
  const professionalsRaw = (data as ProfessionalRaw[]) || []
  const professionalsWithFeatured = professionalsRaw.map((prof) => ({
    ...prof,
    featured: calculateFeaturedStatus(prof),
  }))

  // === Re-sort for Featured (if sortBy === 'featured') ===
  let sortedProfessionals = professionalsWithFeatured
  if (params.sortBy === 'featured') {
    sortedProfessionals = professionalsWithFeatured.sort((a, b) => {
      // Featured professionals come first
      if (a.featured && !b.featured) return -1
      if (!a.featured && b.featured) return 1

      // Within featured/non-featured groups, sort by rating
      const ratingA = a.average_rating ?? 0
      const ratingB = b.average_rating ?? 0
      if (ratingB !== ratingA) return ratingB - ratingA

      // If same rating, sort by completed jobs
      return b.tasks_completed - a.tasks_completed
    })
  }

  // === Calculate Pagination Metadata ===
  const total = count ?? 0
  const totalPages = Math.ceil(total / limit)
  const currentPage = page + 1 // Convert back to 1-indexed
  const hasNext = currentPage < totalPages
  const hasPrevious = currentPage > 1

  // === Fetch Featured Professionals (always, ignoring user filters) ===
  const featuredProfessionals = await getFeaturedProfessionals(8)

  return {
    professionals: sortedProfessionals as any, // Will be privacy-filtered by service layer
    featuredProfessionals: featuredProfessionals as any, // Will be privacy-filtered by service layer
    pagination: {
      page: currentPage,
      limit,
      total,
      totalPages,
      hasNext,
      hasPrevious,
    },
  }
}

/**
 * Get a single professional by ID
 * For future use (professional detail page)
 */
export async function getProfessionalById(
  id: string
): Promise<ProfessionalRaw | null> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', id)
    .not('professional_title', 'is', null)
    .neq('professional_title', '')
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // Not found
      return null
    }
    console.error('Get professional by ID error:', error)
    throw new Error(`Failed to fetch professional: ${error.message}`)
  }

  return data as ProfessionalRaw
}
