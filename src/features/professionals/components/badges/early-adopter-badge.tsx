'use client'

import { Tooltip, Chip } from '@nextui-org/react'
import { Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface EarlyAdopterBadgeProps {
  categories?: string[]
  size?: 'sm' | 'md' | 'lg'
  showTooltip?: boolean
}

/**
 * Early Adopter Badge
 * Displayed for professionals who were among the first 10 in their category
 */
export function EarlyAdopterBadge({
  categories = [],
  size = 'md',
  showTooltip = true,
}: EarlyAdopterBadgeProps) {
  const { t } = useTranslation()

  const sizeClasses = {
    sm: 'h-5 text-xs',
    md: 'h-6 text-sm',
    lg: 'h-7 text-base',
  }

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  }

  const badge = (
    <Chip
      variant="flat"
      color="secondary"
      size={size}
      className={`${sizeClasses[size]} bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-medium`}
      startContent={<Sparkles size={iconSizes[size]} className="text-white" />}
    >
      {t('professionals.badge.earlyAdopter', 'Early Adopter')}
    </Chip>
  )

  if (!showTooltip) {
    return badge
  }

  // Get first category for tooltip (if available)
  const firstCategory = categories[0]
  const categoryLabel = firstCategory
    ? t(`categories.sub.${firstCategory}`, firstCategory)
    : ''

  return (
    <Tooltip
      content={
        categoryLabel
          ? t('professionals.badge.earlyAdopter.tooltip', {
              defaultValue: 'One of the first professionals in {{category}}',
              category: categoryLabel,
            })
          : t('professionals.badge.earlyAdopter.tooltipGeneric', 'One of the first professionals on the platform')
      }
      placement="top"
    >
      {badge}
    </Tooltip>
  )
}
