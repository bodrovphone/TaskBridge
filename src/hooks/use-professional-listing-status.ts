import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { UserProfile } from '@/server/domain/user/user.types'

export interface ProfessionalRequirement {
  key: string
  label: string
  met: boolean
  required: boolean
}

export interface ProfessionalListingStatus {
  /** All requirements with their status */
  requirements: ProfessionalRequirement[]
  /** Whether the profile is listed in search (has title) */
  isListed: boolean
  /** Whether all requirements are complete */
  isComplete: boolean
  /** Missing required fields (blocks listing) */
  missingRequired: ProfessionalRequirement[]
  /** Missing recommended fields (doesn't block listing) */
  missingRecommended: ProfessionalRequirement[]
  /** Count of met requirements */
  metCount: number
  /** Total requirements count */
  totalCount: number
}

/**
 * Hook to check professional profile listing status and requirements
 *
 * Requirements:
 * - Professional title (REQUIRED - blocks listing if missing)
 * - Description/Bio (recommended)
 * - Service categories (recommended)
 *
 * @example
 * const { isListed, isComplete, requirements } = useProfessionalListingStatus(profile)
 *
 * if (!isListed) {
 *   // Show "Add professional title to be listed" message
 * } else if (!isComplete) {
 *   // Show "Complete your profile" suggestions
 * }
 */
export function useProfessionalListingStatus(
  profile: UserProfile | null | undefined
): ProfessionalListingStatus {
  const { t } = useTranslation()

  return useMemo(() => {
    // Default requirements structure (used for both auth and non-auth users)
    const defaultRequirements: ProfessionalRequirement[] = [
      {
        key: 'title',
        label: t('profile.listing.requirement.title', 'Professional title'),
        met: false,
        required: true,
      },
      {
        key: 'bio',
        label: t('profile.listing.requirement.bio', 'Description/Bio'),
        met: false,
        required: false,
      },
      {
        key: 'skills',
        label: t('profile.listing.requirement.skills', 'Service categories'),
        met: false,
        required: false,
      },
    ]

    // Early return for non-authenticated users - all requirements missing
    if (!profile) {
      return {
        requirements: defaultRequirements,
        isListed: false,
        isComplete: false,
        missingRequired: defaultRequirements.filter(r => r.required),
        missingRecommended: defaultRequirements.filter(r => !r.required),
        metCount: 0,
        totalCount: defaultRequirements.length,
      }
    }

    const requirements: ProfessionalRequirement[] = [
      {
        key: 'title',
        label: t('profile.listing.requirement.title', 'Professional title'),
        met: !!(profile.professionalTitle && profile.professionalTitle.length >= 3),
        required: true,
      },
      {
        key: 'bio',
        label: t('profile.listing.requirement.bio', 'Description/Bio'),
        met: !!(profile.bio && profile.bio.length >= 20),
        required: false,
      },
      {
        key: 'skills',
        label: t('profile.listing.requirement.skills', 'Service categories'),
        met: !!(profile.serviceCategories && profile.serviceCategories.length > 0),
        required: false,
      },
    ]

    const isListed = requirements.find(r => r.key === 'title')?.met ?? false
    const isComplete = requirements.every(r => r.met)
    const missingRequired = requirements.filter(r => r.required && !r.met)
    const missingRecommended = requirements.filter(r => !r.required && !r.met)
    const metCount = requirements.filter(r => r.met).length

    return {
      requirements,
      isListed,
      isComplete,
      missingRequired,
      missingRecommended,
      metCount,
      totalCount: requirements.length,
    }
  }, [profile, t])
}
