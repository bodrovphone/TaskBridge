'use client'

import { Button, Chip } from '@heroui/react'
import { Check, Clock, X, Send } from 'lucide-react'
import { useTranslations } from 'next-intl'
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
 const t = useTranslations()

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
   label: t('applicationStatus.pending'),
   variant: 'flat' as const,
  },
  accepted: {
   color: 'success' as const,
   icon: <Check size={16} />,
   label: t('applicationStatus.accepted'),
   variant: 'flat' as const,
  },
  rejected: {
   color: 'default' as const,
   icon: <X size={16} />,
   label: t('applicationStatus.rejected'),
   variant: 'flat' as const,
  },
  withdrawn: {
   color: 'default' as const,
   icon: <X size={16} />,
   label: t('applicationStatus.withdrawn'),
   variant: 'flat' as const,
  },
  removed_by_customer: {
   color: 'danger' as const,
   icon: <X size={16} />,
   label: t('applicationStatus.removedByCustomer'),
   variant: 'flat' as const,
  },
 }

 const config = statusConfig[status as keyof typeof statusConfig]

 // If status is not in our config, show a default badge
 if (!config) {
  return (
   <Chip
    color="default"
    variant="flat"
    size="lg"
    startContent={<Clock size={16} />}
    className={`px-4 py-2 font-semibold ${className}`}
   >
    {status}
   </Chip>
  )
 }

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
