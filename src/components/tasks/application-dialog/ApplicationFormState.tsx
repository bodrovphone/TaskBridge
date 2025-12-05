'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'

import { WizardDialog, type WizardStep } from '@/components/ui/wizard-dialog'
import { NotificationSetupChip } from '@/components/ui/notification-setup-chip'
import { cn } from '@/lib/utils'

import {
  Wallet,
  Clock,
  MessageSquare,
  Sparkles,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'

import {
  containsPhoneNumber,
  containsUrl,
  containsEmail,
  MESSAGE_MAX_LENGTH,
} from './validation'
import { PriceStep, TimelineStep, MessageStep, ReviewStep } from './steps'
import type { ApplicationFormData } from '../types'

interface ApplicationFormStateProps {
  taskTitle: string
  taskBudget?: { min?: number; max?: number }
  isMobile: boolean
  isKeyboardOpen: boolean
  isSubmitting: boolean
  showNotificationWarning: boolean
  onDismissNotificationBanner: () => void
  onSetupNotifications: () => void
  onClose: () => void
  onSubmit: (data: ApplicationFormData) => Promise<void>
  error: string | null
  alreadyApplied: boolean
}

/**
 * Application form state component - Wizard version.
 * Uses a step-by-step wizard for better mobile UX.
 */
export function ApplicationFormState({
  taskTitle,
  taskBudget,
  isMobile,
  isSubmitting,
  showNotificationWarning,
  onDismissNotificationBanner,
  onSetupNotifications,
  onClose,
  onSubmit,
  error,
  alreadyApplied,
}: ApplicationFormStateProps) {
  const { t } = useTranslation()
  const [currentStep, setCurrentStep] = useState(0)

  // Form state
  const [proposedPrice, setProposedPrice] = useState<number | undefined>(undefined)
  const [timeline, setTimeline] = useState('')
  const [message, setMessage] = useState('')

  // Validation errors
  const [priceError, setPriceError] = useState<string | undefined>()
  const [timelineError, setTimelineError] = useState<string | undefined>()
  const [messageError, setMessageError] = useState<string | undefined>()

  // Validate price
  const validatePrice = useCallback((value: number | undefined): boolean => {
    if (value === undefined) {
      setPriceError(t('application.errors.priceRequired'))
      return false
    }
    if (value < 0) {
      setPriceError(t('application.errors.priceMin'))
      return false
    }
    setPriceError(undefined)
    return true
  }, [t])

  // Validate timeline
  const validateTimeline = useCallback((value: string): boolean => {
    if (!value || value.length === 0) {
      setTimelineError(t('application.errors.timelineRequired'))
      return false
    }
    setTimelineError(undefined)
    return true
  }, [t])

  // Validate message
  const validateMessage = useCallback((value: string): boolean => {
    if (value && value.length > MESSAGE_MAX_LENGTH) {
      setMessageError(t('application.errors.messageMax'))
      return false
    }
    if (value && containsPhoneNumber(value)) {
      setMessageError(t('application.errors.noPhoneNumbers'))
      return false
    }
    if (value && containsUrl(value)) {
      setMessageError(t('application.errors.noUrls'))
      return false
    }
    if (value && containsEmail(value)) {
      setMessageError(t('application.errors.noEmails'))
      return false
    }
    setMessageError(undefined)
    return true
  }, [t])

  // Handle submit
  const handleComplete = useCallback(async () => {
    await onSubmit({
      proposedPrice: proposedPrice ?? 0,
      timeline,
      message,
    })
  }, [proposedPrice, timeline, message, onSubmit])

  // Navigation helpers for Review step edit buttons
  const goToStep = useCallback((step: number) => {
    setCurrentStep(step)
  }, [])

  // Build wizard steps
  const steps: WizardStep[] = useMemo(() => [
    {
      id: 'price',
      title: t('application.wizard.step1Title', 'Your Offer'),
      subtitle: t('application.wizard.step1Subtitle', 'Set your price'),
      icon: <Wallet className="w-4 h-4 text-green-600" />,
      content: (
        <div className="space-y-4">
          {/* Notification setup chip */}
          {showNotificationWarning && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <NotificationSetupChip
                onSetup={onSetupNotifications}
                onDismiss={onDismissNotificationBanner}
              />
            </motion.div>
          )}

          {/* Already applied warning */}
          {alreadyApplied && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                {t('application.alreadyApplied')}
              </p>
            </div>
          )}

          <PriceStep
            value={proposedPrice}
            onChange={(value) => {
              setProposedPrice(value)
              validatePrice(value)
            }}
            taskBudget={taskBudget}
            error={priceError}
          />
        </div>
      ),
      isValid: () => validatePrice(proposedPrice),
    },
    {
      id: 'timeline',
      title: t('application.wizard.step2Title', 'Availability'),
      subtitle: t('application.wizard.step2Subtitle', 'When can you do it?'),
      icon: <Clock className="w-4 h-4 text-blue-600" />,
      content: (
        <TimelineStep
          value={timeline}
          onChange={(value) => {
            setTimeline(value)
            validateTimeline(value)
          }}
          error={timelineError}
        />
      ),
      isValid: () => validateTimeline(timeline),
    },
    {
      id: 'message',
      title: t('application.wizard.step3Title', 'Cover Letter'),
      subtitle: t('application.wizard.step3Subtitle', 'Introduce yourself'),
      icon: <MessageSquare className="w-4 h-4 text-purple-600" />,
      content: (
        <MessageStep
          value={message}
          onChange={(value) => {
            setMessage(value)
            validateMessage(value)
          }}
          error={messageError}
        />
      ),
      isOptional: true,
      isValid: () => validateMessage(message),
    },
    {
      id: 'review',
      title: t('application.wizard.step4Title', 'Review'),
      subtitle: t('application.wizard.step4Subtitle', 'Confirm your application'),
      icon: <CheckCircle className="w-4 h-4 text-green-600" />,
      content: (
        <ReviewStep
          proposedPrice={proposedPrice}
          timeline={timeline}
          message={message}
          taskTitle={taskTitle}
          onEditPrice={() => goToStep(0)}
          onEditTimeline={() => goToStep(1)}
          onEditMessage={() => goToStep(2)}
        />
      ),
      isValid: () => true,
    },
  ], [
    t,
    proposedPrice,
    timeline,
    message,
    taskTitle,
    taskBudget,
    priceError,
    timelineError,
    messageError,
    showNotificationWarning,
    alreadyApplied,
    onSetupNotifications,
    onDismissNotificationBanner,
    validatePrice,
    validateTimeline,
    validateMessage,
    goToStep,
  ])

  return (
    <WizardDialog
      steps={steps}
      onComplete={handleComplete}
      onClose={onClose}
      isSubmitting={isSubmitting}
      submitText={t('application.submit')}
      isMobile={isMobile}
      headerGradient="from-blue-600 to-blue-500"
      headerIcon={<Sparkles className="w-5 h-5 text-white" />}
      title={t('application.title')}
      subtitle={taskTitle}
      error={error}
    />
  )
}

export default ApplicationFormState
