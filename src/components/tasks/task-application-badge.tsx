'use client'

import { Button, Chip } from '@nextui-org/react'
import { Check, Clock, X, Send } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { ApplicationStatus } from './types'

interface TaskApplicationBadgeProps {
  status?: ApplicationStatus | null
  onClick?: () => void
  isDisabled?: boolean
  className?: string
}

export default function TaskApplicationBadge({
  status,
  onClick,
  isDisabled = false,
  className = '',
}: TaskApplicationBadgeProps) {
  const { t } = useTranslation()

  // If no status, show "Apply" button
  if (!status) {
    return (
      <Button
        color="secondary"
        variant="shadow"
        size="lg"
        onPress={onClick}
        isDisabled={isDisabled}
        className={`font-bold bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all ${className}`}
        endContent={<Send size={18} />}
      >
        {t('taskDetail.apply')}
      </Button>
    )
  }

  // Status-based badge rendering
  const statusConfig = {
    pending: {
      color: 'warning' as const,
      icon: <Clock size={16} />,
      label: 'Pending Review',
      variant: 'flat' as const,
    },
    accepted: {
      color: 'success' as const,
      icon: <Check size={16} />,
      label: 'Accepted',
      variant: 'flat' as const,
    },
    rejected: {
      color: 'default' as const,
      icon: <X size={16} />,
      label: 'Rejected',
      variant: 'flat' as const,
    },
    withdrawn: {
      color: 'default' as const,
      icon: <X size={16} />,
      label: 'Withdrawn',
      variant: 'flat' as const,
    },
  }

  const config = statusConfig[status]

  return (
    <Chip
      color={config.color}
      variant={config.variant}
      size="lg"
      startContent={config.icon}
      className={`px-4 py-2 font-semibold ${className}`}
    >
      {config.label}
    </Chip>
  )
}
