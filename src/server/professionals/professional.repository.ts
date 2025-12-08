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
 * Get badge data from professional record
 */
function getBadgeData(prof: ProfessionalRaw) {
  return {
    is_early_adopter: prof.is_early_adopter || false,
    early_adopter_categories: prof.early_adopter_categories || [],
    is_top_professional: prof.is_top_professional || false,
    top_professional_until: prof.top_professional_until || null,
    top_professional_tasks_count: prof.top_professional_tasks_count || 0,
    is_featured: prof.is_featured || false,
  }
}

/**
 * Fetch featured professionals with DB-first approach + quality scoring fallback
 *
 * Priority order:
 * 1. DB-flagged featured (is_featured, is_early_adopter, is_top_professional)
 * 2. Fallback: Quality scoring algorithm for remaining slots
 *
 * Returns up to `limit` professionals with category diversity
 */
export async function getFeaturedProfessionals(limit: number = 20): Promise<Professional[]> {
  const now = new Date().toISOString()

  // === Step 1: Fetch DB-flagged featured professionals ===
  const { data: dbFeatured, error: dbError } = await supabaseAdmin
    .from('users')
    .select('*')
    .not('professional_title', 'is', null)
    .neq('is_banned', true)
    .or(`is_featured.eq.true,is_early_adopter.eq.true,and(is_top_professional.eq.true,top_professional_until.gte.${now})`)
    .limit(limit)

  if (dbError) {
    console.error('DB featured professionals query error:', dbError)
  }

  const dbFeaturedProfessionals = (dbFeatured as ProfessionalRaw[]) || []
  const dbFeaturedWithStatus = dbFeaturedProfessionals.map((prof) => ({
    ...prof,
    featured: calculateFeaturedStatus(prof),
    ...getBadgeData(prof),
  })) as Professional[]

  // If we have enough DB-flagged professionals, apply diversity and return
  if (dbFeaturedWithStatus.length >= limit) {
    return applyDiversityShuffle(dbFeaturedWithStatus, limit)
  }

  // === Step 2: Fallback - fetch more using quality scoring ===
  const excludeIds = dbFeaturedWithStatus.map((p) => p.id)
  const remainingSlots = limit - dbFeaturedWithStatus.length

  const fallbackProfessionals = await getQualityScoredProfessionals(
    remainingSlots,
    excludeIds
  )

  // Combine DB-featured (first) + fallback (second)
  const combined = [...dbFeaturedWithStatus, ...fallbackProfessionals]
  return applyDiversityShuffle(combined, limit)
}

/**
 * Get professionals using quality scoring algorithm
 * Used as fallback when not enough DB-flagged featured professionals
 */
async function getQualityScoredProfessionals(
  limit: number,
  excludeIds: string[] = []
): Promise<Professional[]> {
  // Build query
  let query = supabaseAdmin
    .from('users')
    .select('*')
    .not('professional_title', 'is', null)
    .neq('is_banned', true)
    .order('created_at', { ascending: false })
    .limit(50) // Fetch more for scoring

  // Exclude already-selected professionals
  if (excludeIds.length > 0) {
    query = query.not('id', 'in', `(${excludeIds.join(',')})`)
  }

  const { data, error } = await query

  if (error) {
    console.error('Quality scored professionals query error:', error)
    return []
  }

  const professionalsRaw = (data as ProfessionalRaw[]) || []

  if (professionalsRaw.length === 0) {
    return []
  }

  // Score each professional
  const scoredProfessionals = professionalsRaw.map((prof) => {
    let score = 0

    // Has profile photo: +3 points
    if (prof.avatar_url) {
      score += 3
    }

    // Long bio (>150 chars): +2 points
    if (prof.bio && prof.bio.length > 150) {
      score += 2
    }

    // Has reviews/ratings: +2 points
    if (prof.total_reviews > 0 && prof.average_rating !== null) {
      score += 2
    }

    // VAT verified: +3 points
    if (prof.is_vat_verified) {
      score += 3
    }

    // High rating (>= 4.5): +2 points
    if (prof.average_rating && prof.average_rating >= 4.5) {
      score += 2
    }

    return {
      professional: {
        ...prof,
        featured: calculateFeaturedStatus(prof),
        ...getBadgeData(prof),
      } as Professional,
      score,
    }
  })

  // Sort by score descending
  scoredProfessionals.sort((a, b) => b.score - a.score)

  // Return top `limit` professionals
  return scoredProfessionals.slice(0, limit).map((s) => s.professional)
}

/**
 * Apply category diversity to a list of professionals
 * Ensures no more than 2 professionals from the same primary category
 * Also shuffles within groups for fairness
 */
function applyDiversityShuffle(
  professionals: Professional[],
  limit: number
): Professional[] {
  const selectedProfessionals: Professional[] = []
  const categoryCount = new Map<string, number>()

  // First pass: add professionals with category limits
  for (const professional of professionals) {
    if (selectedProfessionals.length >= limit) break

    // Get primary category (first in array)
    const primaryCategory = professional.service_categories?.[0] || 'other'
    const currentCount = categoryCount.get(primaryCategory) || 0

    // Allow max 2 professionals per category for diversity
    if (currentCount < 2) {
      selectedProfessionals.push(professional)
      categoryCount.set(primaryCategory, currentCount + 1)
    }
  }

  // Second pass: fill remaining slots if needed (relaxed rules)
  if (selectedProfessionals.length < limit) {
    for (const professional of professionals) {
      if (selectedProfessionals.length >= limit) break

      // Skip if already added
      if (!selectedProfessionals.find((p) => p.id === professional.id)) {
        selectedProfessionals.push(professional)
      }
    }
  }

  return selectedProfessionals
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

  // === Calculate Featured Status + Badge Data ===
  const professionalsRaw = (data as ProfessionalRaw[]) || []
  const professionalsWithFeatured = professionalsRaw.map((prof) => ({
    ...prof,
    featured: calculateFeaturedStatus(prof),
    ...getBadgeData(prof),
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
  const featuredProfessionals = await getFeaturedProfessionals(20)

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
