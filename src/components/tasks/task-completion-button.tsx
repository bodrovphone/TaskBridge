'use client'

import { Button } from '@nextui-org/react'
import { CheckCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface TaskCompletionButtonProps {
  taskStatus: 'open' | 'in_progress' | 'pending_professional_confirmation' | 'pending_customer_confirmation' | 'completed' | 'cancelled'
  userRole: 'customer' | 'professional'
  alreadyMarked?: boolean
  onPress: () => void
  isLoading?: boolean
  className?: string
}

export function TaskCompletionButton({
  taskStatus,
  userRole,
  alreadyMarked = false,
  onPress,
  isLoading = false,
  className = ''
}: TaskCompletionButtonProps) {
  const { t } = useTranslation()

  // Only show button for in_progress tasks or pending confirmation states
  if (taskStatus === 'completed' || taskStatus === 'cancelled' || taskStatus === 'open') {
    return null
  }

  // If user already marked as complete, show disabled state
  if (alreadyMarked) {
    return (
      <Button
        size="lg"
        variant="flat"
        color="success"
        startContent={<CheckCircle className="w-5 h-5" />}
        isDisabled
        className={`shadow-md ${className}`}
      >
        {userRole === 'professional'
          ? t('taskCompletion.alreadyMarkedByYou')
          : t('taskCompletion.alreadyConfirmedByYou')}
      </Button>
    )
  }

  // Show appropriate button based on task status and user role
  const getButtonConfig = () => {
    // Task is in_progress - either party can mark as complete
    if (taskStatus === 'in_progress') {
      return {
        label: userRole === 'professional'
          ? t('taskCompletion.markCompleted')
          : t('taskCompletion.markCompleted'),
        color: 'primary' as const
      }
    }

    // Professional marked complete, waiting for customer confirmation
    if (taskStatus === 'pending_customer_confirmation' && userRole === 'customer') {
      return {
        label: t('taskCompletion.confirmCompletion'),
        color: 'success' as const
      }
    }

    // Customer marked complete, waiting for professional confirmation
    if (taskStatus === 'pending_professional_confirmation' && userRole === 'professional') {
      return {
        label: t('taskCompletion.confirmCompletion'),
        color: 'success' as const
      }
    }

    return null
  }

  const config = getButtonConfig()

  if (!config) {
    return null
  }

  return (
    <Button
      size="lg"
      color={config.color}
      startContent={<CheckCircle className="w-5 h-5" />}
      onPress={onPress}
      isLoading={isLoading}
      className={`shadow-lg font-semibold ${className}`}
    >
      {config.label}
    </Button>
  )
}
