/**
 * Badge Service
 * Handles professional badge logic (Early Adopter, Top Professional)
 */

import { createAdminClient } from '@/lib/supabase/server'

const EARLY_ADOPTER_THRESHOLD = 10 // First 10 professionals per category

/**
 * Check and assign Early Adopter status for a professional
 * Called when a professional updates their service_categories
 *
 * @param userId - The professional's user ID
 * @param newCategories - The new service categories being set
 * @param existingCategories - The professional's existing categories (to detect newly added ones)
 */
export async function checkAndAssignEarlyAdopterStatus(
  userId: string,
  newCategories: string[],
  existingCategories: string[] = []
): Promise<{ assignedCategories: string[]; alreadyEarlyAdopter: boolean }> {
  const supabase = createAdminClient()

  // Find newly added categories
  const addedCategories = newCategories.filter(
    (cat) => !existingCategories.includes(cat)
  )

  if (addedCategories.length === 0) {
    return { assignedCategories: [], alreadyEarlyAdopter: false }
  }

  // Get current user's early adopter status
  const { data: currentUser } = await supabase
    .from('users')
    .select('is_early_adopter, early_adopter_categories')
    .eq('id', userId)
    .single()

  const currentEarlyAdopterCategories: string[] =
    currentUser?.early_adopter_categories || []

  const newEarlyAdopterCategories: string[] = []

  // Check each newly added category
  for (const category of addedCategories) {
    // Skip if already an early adopter for this category
    if (currentEarlyAdopterCategories.includes(category)) {
      continue
    }

    // Count professionals in this category (excluding current user)
    const { count } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .contains('service_categories', [category])
      .not('professional_title', 'is', null)
      .neq('id', userId)

    // If less than threshold, this user is an early adopter
    if ((count ?? 0) < EARLY_ADOPTER_THRESHOLD) {
      newEarlyAdopterCategories.push(category)
    }
  }

  // Update user if they qualified for any new early adopter categories
  if (newEarlyAdopterCategories.length > 0) {
    const allEarlyAdopterCategories = [
      ...currentEarlyAdopterCategories,
      ...newEarlyAdopterCategories,
    ]

    await supabase
      .from('users')
      .update({
        is_early_adopter: true,
        early_adopter_categories: allEarlyAdopterCategories,
      })
      .eq('id', userId)

    return {
      assignedCategories: newEarlyAdopterCategories,
      alreadyEarlyAdopter: currentUser?.is_early_adopter || false,
    }
  }

  return {
    assignedCategories: [],
    alreadyEarlyAdopter: currentUser?.is_early_adopter || false,
  }
}

/**
 * Get badge status for a professional
 * Used to display badges on profile/cards
 *
 * @param userId - The professional's user ID
 */
export async function getProfessionalBadges(userId: string): Promise<{
  isEarlyAdopter: boolean
  earlyAdopterCategories: string[]
  isTopProfessional: boolean
  topProfessionalTasksCount: number
  topProfessionalUntil: string | null
  isFeatured: boolean
}> {
  const supabase = createAdminClient()

  const { data } = await supabase
    .from('users')
    .select(
      `
      is_early_adopter,
      early_adopter_categories,
      is_top_professional,
      top_professional_tasks_count,
      top_professional_until,
      is_featured,
      featured_until
    `
    )
    .eq('id', userId)
    .single()

  if (!data) {
    return {
      isEarlyAdopter: false,
      earlyAdopterCategories: [],
      isTopProfessional: false,
      topProfessionalTasksCount: 0,
      topProfessionalUntil: null,
      isFeatured: false,
    }
  }

  // Check if Top Professional badge is still valid (not expired)
  const now = new Date()
  const topProfessionalUntil = data.top_professional_until
    ? new Date(data.top_professional_until)
    : null
  const isTopProfessionalValid =
    data.is_top_professional &&
    topProfessionalUntil &&
    topProfessionalUntil > now

  // Check if featured status is still valid
  const featuredUntil = data.featured_until
    ? new Date(data.featured_until)
    : null
  const isFeaturedValid =
    data.is_featured && (!featuredUntil || featuredUntil > now)

  return {
    isEarlyAdopter: data.is_early_adopter || false,
    earlyAdopterCategories: data.early_adopter_categories || [],
    isTopProfessional: isTopProfessionalValid || false,
    topProfessionalTasksCount: data.top_professional_tasks_count || 0,
    topProfessionalUntil: data.top_professional_until,
    isFeatured: isFeaturedValid || false,
  }
}
