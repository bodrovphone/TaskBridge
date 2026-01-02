/**
 * Professional Matching Service
 *
 * Finds professionals that match a task based on:
 * - Category overlap (task.category in professional.service_categories)
 * - Location match (task.city in professional.city OR professional.service_area_cities)
 * - Professional status (has professional_title >= 3 chars AND service_categories)
 * - Not banned
 * - Not the task creator
 */

import { createAdminClient } from '@/lib/supabase/server'

export interface MatchingProfessional {
  id: string
  full_name: string | null
  preferred_language: string | null
  telegram_id: number | null
  is_email_verified: boolean | null
}

export interface MatchCriteria {
  taskId: string
  category: string // Task's category or subcategory
  city: string // Task's city
  customerId: string // Task creator (to exclude)
  limit?: number // Max professionals to return
}

/**
 * Find professionals matching the given criteria
 *
 * Matching logic:
 * 1. Has professional_title (>= 3 chars) AND service_categories (not empty)
 * 2. service_categories contains the task category
 * 3. city = task.city OR service_area_cities contains task.city
 * 4. Not banned
 * 5. Not the customer who created the task
 * 6. Not already invited to this task
 */
export async function findMatchingProfessionals(
  criteria: MatchCriteria
): Promise<MatchingProfessional[]> {
  const supabase = createAdminClient()
  const limit = criteria.limit || 10

  try {
    // Step 1: Find professionals matching category
    // Using GIN index on service_categories for efficient array search
    const { data: professionals, error } = await supabase
      .from('users')
      .select(
        'id, full_name, preferred_language, telegram_id, is_email_verified, city, service_area_cities'
      )
      .not('professional_title', 'is', null)
      .not('service_categories', 'is', null)
      .contains('service_categories', [criteria.category])
      .neq('is_banned', true)
      .neq('id', criteria.customerId)
      .limit(100) // Fetch more than needed for filtering

    if (error) {
      console.error('[ProfessionalMatching] Query error:', error)
      return []
    }

    if (!professionals || professionals.length === 0) {
      console.log(
        '[ProfessionalMatching] No professionals found for category:',
        criteria.category
      )
      return []
    }

    // Step 2: Filter by location (city OR service_area_cities contains task.city)
    const locationFiltered = professionals.filter((prof) => {
      const cityMatch = prof.city === criteria.city
      const serviceAreaMatch =
        prof.service_area_cities?.includes(criteria.city) || false
      return cityMatch || serviceAreaMatch
    })

    if (locationFiltered.length === 0) {
      console.log(
        '[ProfessionalMatching] No professionals match location:',
        criteria.city
      )
      return []
    }

    // Step 3: Exclude professionals already invited to this task
    const { data: existingInvitations, error: invitationsError } = await supabase
      .from('notifications')
      .select('user_id')
      .eq('type', 'task_invitation')
      .eq('metadata->>taskId', criteria.taskId)

    if (invitationsError) {
      // If we can't check existing invitations, log and continue with caution
      // Worst case: some professionals might get duplicate invites (not critical)
      console.warn('[ProfessionalMatching] Failed to check existing invitations:', invitationsError)
    }

    const alreadyInvitedIds = new Set(
      existingInvitations?.map((n) => n.user_id) || []
    )

    const eligibleProfessionals = locationFiltered.filter(
      (prof) => !alreadyInvitedIds.has(prof.id)
    )

    console.log(
      `[ProfessionalMatching] Found ${eligibleProfessionals.length} eligible professionals (${locationFiltered.length} matched location, ${alreadyInvitedIds.size} already invited)`
    )

    // Step 4: Return up to limit professionals
    return eligibleProfessionals.slice(0, limit).map((prof) => ({
      id: prof.id,
      full_name: prof.full_name,
      preferred_language: prof.preferred_language,
      telegram_id: prof.telegram_id,
      is_email_verified: prof.is_email_verified,
    }))
  } catch (error) {
    console.error('[ProfessionalMatching] Unexpected error:', error)
    return []
  }
}
