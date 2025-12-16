import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { UserProfile } from '@/server/domain/user/user.types'

export interface ProfessionalRequirement {
  key: string
  label: string
  met: boolean
  required: boolean
  /** Section ID for scroll targeting */
  sectionId: string
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
  /** Section ID of first incomplete requirement (for scroll targeting) */
  firstIncompleteSectionId: string | null
  /** Set of section IDs that have incomplete requirements (for highlighting) */
  incompleteSectionIds: Set<string>
}

/**
 * Hook to check professional profile listing status and requirements
 *
 * Requirements (ALL REQUIRED for listing in search):
 * - Professional title (>= 3 chars)
 * - Description/Bio (>= 20 chars)
 * - Service categories (at least 1)
 *
 * @example
 * const { isListed, isComplete, requirements } = useProfessionalListingStatus(profile)
 *
 * if (!isListed) {
 *   // Show "Complete required fields to be listed" message
 * }
 */
export function useProfessionalListingStatus(
  profile: UserProfile | null | undefined
): ProfessionalListingStatus {
  const { t } = useTranslation()

  return useMemo(() => {
    // Default requirements structure (used for both auth and non-auth users)
    // All fields are REQUIRED to appear in professional search results
    const defaultRequirements: ProfessionalRequirement[] = [
      {
        key: 'title',
        label: t('profile.listing.requirement.title', 'Professional title'),
        met: false,
        required: true,
        sectionId: 'professional-identity-section',
      },
      {
        key: 'bio',
        label: t('profile.listing.requirement.bio', 'Description/Bio'),
        met: false,
        required: true,
        sectionId: 'professional-identity-section',
      },
      {
        key: 'skills',
        label: t('profile.listing.requirement.skills', 'Service categories'),
        met: false,
        required: true,
        sectionId: 'service-categories-section',
      },
    ]

    // Early return for non-authenticated users - all requirements missing
    if (!profile) {
      const allSectionIds = new Set(defaultRequirements.map(r => r.sectionId))
      return {
        requirements: defaultRequirements,
        isListed: false,
        isComplete: false,
        missingRequired: defaultRequirements.filter(r => r.required),
        missingRecommended: defaultRequirements.filter(r => !r.required),
        metCount: 0,
        totalCount: defaultRequirements.length,
        firstIncompleteSectionId: defaultRequirements[0]?.sectionId || null,
        incompleteSectionIds: allSectionIds,
      }
    }

    // All fields are REQUIRED to appear in professional search results
    const requirements: ProfessionalRequirement[] = [
      {
        key: 'title',
        label: t('profile.listing.requirement.title', 'Professional title'),
        met: !!(profile.professionalTitle && profile.professionalTitle.length >= 3),
        required: true,
        sectionId: 'professional-identity-section',
      },
      {
        key: 'bio',
        label: t('profile.listing.requirement.bio', 'Description/Bio'),
        met: !!(profile.bio && profile.bio.length >= 20),
        required: true,
        sectionId: 'professional-identity-section',
      },
      {
        key: 'skills',
        label: t('profile.listing.requirement.skills', 'Service categories'),
        met: !!(profile.serviceCategories && profile.serviceCategories.length > 0),
        required: true,
        sectionId: 'service-categories-section',
      },
    ]

    // Profile is listed only when ALL required fields are complete
    const isListed = requirements.filter(r => r.required).every(r => r.met)
    const isComplete = requirements.every(r => r.met)
    const missingRequired = requirements.filter(r => r.required && !r.met)
    const missingRecommended = requirements.filter(r => !r.required && !r.met)
    const metCount = requirements.filter(r => r.met).length

    // Get first incomplete section (prioritize required fields)
    const firstIncomplete = missingRequired[0] || missingRecommended[0]
    const firstIncompleteSectionId = firstIncomplete?.sectionId || null

    // Get all section IDs with incomplete requirements
    const incompleteSectionIds = new Set(
      requirements.filter(r => !r.met).map(r => r.sectionId)
    )

    return {
      requirements,
      isListed,
      isComplete,
      missingRequired,
      missingRecommended,
      metCount,
      totalCount: requirements.length,
      firstIncompleteSectionId,
      incompleteSectionIds,
    }
  }, [profile, t])
}
