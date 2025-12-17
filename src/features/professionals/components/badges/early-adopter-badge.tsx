'use client'

import { useState } from 'react'
import { Chip } from '@nextui-org/react'
import { Star } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Tip } from '@/components/ui/tip'

interface EarlyAdopterBadgeProps {
  categories?: string[]
  size?: 'sm' | 'md' | 'lg'
  showTooltip?: boolean
}

/**
 * Featured Professional Badge
 * Displayed for professionals who were among the first 10 in their category
 */
export function EarlyAdopterBadge({
  size = 'md',
  showTooltip = true,
}: EarlyAdopterBadgeProps) {
  const t = useTranslations()
  const [isOpen, setIsOpen] = useState(false)

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
      className={`${sizeClasses[size]} bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium cursor-pointer`}
      startContent={<Star size={iconSizes[size]} className="text-white fill-white" />}
    >
      {t('professionals.badge.earlyAdopterLabel')}
    </Chip>
  )

  if (!showTooltip) {
    return badge
  }

  return (
    <Tip
      title={t('professionals.badge.earlyAdopterLabel')}
      description={t('professionals.badge.earlyAdopter.tooltip')}
      variant="warning"
      side="bottom"
      align="center"
      dismissText={t('common.gotIt')}
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      {badge}
    </Tip>
  )
}
