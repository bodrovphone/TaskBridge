'use client'

import { TopProfessionalBadge } from './top-professional-badge'
import { EarlyAdopterBadge } from './early-adopter-badge'

interface BadgeDisplayProps {
  isTopProfessional?: boolean
  topProfessionalTasksCount?: number
  isEarlyAdopter?: boolean
  earlyAdopterCategories?: string[]
  size?: 'sm' | 'md' | 'lg'
  showTooltips?: boolean
  className?: string
}

/**
 * Badge Display
 * Renders all applicable badges for a professional
 * Used on ProfessionalCard and Professional detail page
 */
export function BadgeDisplay({
  isTopProfessional = false,
  topProfessionalTasksCount = 0,
  isEarlyAdopter = false,
  earlyAdopterCategories = [],
  size = 'md',
  showTooltips = true,
  className = '',
}: BadgeDisplayProps) {
  const hasBadges = isTopProfessional || isEarlyAdopter

  if (!hasBadges) {
    return null
  }

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {isTopProfessional && (
        <TopProfessionalBadge
          tasksCount={topProfessionalTasksCount}
          size={size}
          showTooltip={showTooltips}
        />
      )}
      {isEarlyAdopter && (
        <EarlyAdopterBadge
          categories={earlyAdopterCategories}
          size={size}
          showTooltip={showTooltips}
        />
      )}
    </div>
  )
}
