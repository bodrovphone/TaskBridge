'use client'

import { Tooltip, Chip } from '@nextui-org/react'
import { Trophy } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface TopProfessionalBadgeProps {
  tasksCount?: number
  size?: 'sm' | 'md' | 'lg'
  showTooltip?: boolean
}

/**
 * Top Professional Badge
 * Displayed for professionals who completed 2+ tasks in the last 30 days
 */
export function TopProfessionalBadge({
  tasksCount = 0,
  size = 'md',
  showTooltip = true,
}: TopProfessionalBadgeProps) {
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
      color="warning"
      size={size}
      className={`${sizeClasses[size]} bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium`}
      startContent={<Trophy size={iconSizes[size]} className="text-white" />}
    >
      {t('professionals.badge.topProfessional', 'Top Professional')}
    </Chip>
  )

  if (!showTooltip) {
    return badge
  }

  return (
    <Tooltip
      content={t('professionals.badge.topProfessional.tooltip', {
        defaultValue: 'Completed {{count}} tasks in the last 30 days',
        count: tasksCount,
      })}
      placement="top"
    >
      {badge}
    </Tooltip>
  )
}
