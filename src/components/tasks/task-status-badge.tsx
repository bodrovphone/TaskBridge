'use client'

import { Chip, Tooltip } from '@nextui-org/react'
import {
  Lock,
  Settings,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

export type TaskStatus =
  | 'open'
  | 'in_progress'
  | 'pending_professional_confirmation'
  | 'pending_customer_confirmation'
  | 'completed'
  | 'cancelled'
  | 'disputed'

interface TaskStatusBadgeProps {
  status: TaskStatus
  size?: 'sm' | 'md' | 'lg'
  showTooltip?: boolean
  className?: string
}

export function TaskStatusBadge({
  status,
  size = 'md',
  showTooltip = true,
  className = ''
}: TaskStatusBadgeProps) {
  const { t } = useTranslation()

  const statusConfig = {
    open: {
      label: t('taskStatus.open'),
      icon: Lock,
      color: 'primary' as const,
      tooltip: t('taskStatus.openTooltip'),
      variant: 'flat' as const
    },
    in_progress: {
      label: t('taskStatus.inProgress'),
      icon: Settings,
      color: 'warning' as const,
      tooltip: t('taskStatus.inProgressTooltip'),
      variant: 'flat' as const
    },
    pending_professional_confirmation: {
      label: t('taskStatus.awaitingConfirmation'),
      icon: Clock,
      color: 'warning' as const,
      tooltip: t('taskStatus.pendingProfessionalTooltip'),
      variant: 'flat' as const
    },
    pending_customer_confirmation: {
      label: t('taskStatus.awaitingConfirmation'),
      icon: Clock,
      color: 'warning' as const,
      tooltip: t('taskStatus.pendingCustomerTooltip'),
      variant: 'flat' as const
    },
    completed: {
      label: t('taskStatus.completed'),
      icon: CheckCircle,
      color: 'success' as const,
      tooltip: t('taskStatus.completedTooltip'),
      variant: 'flat' as const
    },
    cancelled: {
      label: t('taskStatus.cancelled'),
      icon: XCircle,
      color: 'danger' as const,
      tooltip: t('taskStatus.cancelledTooltip'),
      variant: 'flat' as const
    },
    disputed: {
      label: t('taskStatus.underReview'),
      icon: AlertTriangle,
      color: 'danger' as const,
      tooltip: t('taskStatus.disputedTooltip'),
      variant: 'flat' as const
    }
  }

  const config = statusConfig[status]
  const Icon = config.icon

  const badge = (
    <Chip
      startContent={<Icon className="w-3.5 h-3.5" />}
      color={config.color}
      variant={config.variant}
      size={size}
      className={`shadow-sm ${className}`}
    >
      {config.label}
    </Chip>
  )

  if (!showTooltip) {
    return badge
  }

  return (
    <Tooltip content={config.tooltip} placement="top" delay={300}>
      {badge}
    </Tooltip>
  )
}
