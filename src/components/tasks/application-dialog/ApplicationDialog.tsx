'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter, useParams } from 'next/navigation'
import { AnimatePresence } from 'framer-motion'

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAuth } from '@/features/auth'
import { useKeyboardHeight } from '@/hooks/use-keyboard-height'
import { useIsMobile } from '@/hooks/use-is-mobile'
import { cn } from '@/lib/utils'

import { ApplicationFormState } from './ApplicationFormState'
import { ApplicationSuccessState } from './ApplicationSuccessState'
import { TIMELINE_HOURS_MAP } from './modal-config'
import type { ApplicationFormData } from '../types'

interface ApplicationDialogProps {
  isOpen: boolean
  onClose: () => void
  taskId: string
  taskTitle: string
  taskBudget?: { min?: number; max?: number }
}

/**
 * Application Dialog - Main orchestrator component (Radix UI version)
 *
 * Handles the complete application flow:
 * 1. Form state for submitting applications
 * 2. Success state with confetti animation
 * 3. Navigation after submission
 *
 * Migrated from NextUI Modal to Radix UI Dialog for:
 * - Better mobile keyboard handling
 * - Native browser compatibility
 * - Cleaner scroll behavior
 */
export default function ApplicationDialog({
  isOpen,
  onClose,
  taskId,
  taskTitle,
  taskBudget,
}: ApplicationDialogProps) {
  const t = useTranslations()
  const router = useRouter()
  const { user, authenticatedFetch } = useAuth()
  const isKeyboardOpen = useKeyboardHeight()
  const isMobile = useIsMobile()

  // Dialog state
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [alreadyApplied, setAlreadyApplied] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Notification state
  const [showNotificationWarning, setShowNotificationWarning] = useState(false)
  const [bannerDismissed, setBannerDismissed] = useState(false)

  // Check notification status when modal opens
  useEffect(() => {
    if (user?.id && isOpen) {
      fetch(`/api/users/${user.id}/notification-channel`)
        .then((res) => res.json())
        .then((data) => setShowNotificationWarning(data.showWarning || false))
        .catch(() => setShowNotificationWarning(false))
    }
  }, [user?.id, isOpen])

  // Reset state when dialog closes
  const handleClose = useCallback(() => {
    // Prevent closing while submitting (unless success)
    if (isSubmitting && !isSuccess) return

    setIsSuccess(false)
    setError(null)
    setAlreadyApplied(false)
    setBannerDismissed(false)
    onClose()
  }, [onClose, isSubmitting, isSuccess])

  // Form submission handler
  const handleSubmit = useCallback(
    async (value: ApplicationFormData) => {
      setError(null)
      setIsSubmitting(true)

      try {
        // @todo REFACTORING: Send timeline string directly instead of converting to hours.
        // See: todo_tasks/refactor-timeline-to-proposed-timeline.md
        const response = await authenticatedFetch('/api/applications', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            taskId,
            proposedPrice: value.proposedPrice,
            estimatedDurationHours: TIMELINE_HOURS_MAP[value.timeline] || null,
            message: value.message || null,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to submit application')
        }

        setIsSuccess(true)
      } catch (err) {
        console.error('Application submission error:', err)
        setError(err instanceof Error ? err.message : 'Failed to submit application')
      } finally {
        setIsSubmitting(false)
      }
    },
    [authenticatedFetch, taskId]
  )

  // Navigation handlers
  const params = useParams()
  const currentLang = (params?.lang as string) || 'bg'

  const handleViewApplication = useCallback(() => {
    handleClose()
    router.push(`/${currentLang}/tasks/applications`)
  }, [handleClose, router, currentLang])

  const handleBrowseOther = useCallback(() => {
    handleClose()
    router.push(`/${currentLang}/browse-tasks`)
  }, [handleClose, router, currentLang])

  const handleSetupNotifications = useCallback(() => {
    router.push(`/${currentLang}/profile/professional`)
    handleClose()
  }, [router, currentLang, handleClose])

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        hideCloseButton
        className={cn(
          'max-w-lg p-0 gap-0 !bg-transparent flex flex-col overflow-hidden border-0',
          isMobile
            ? 'h-full max-h-full w-full rounded-none !inset-0 !translate-x-0 !translate-y-0'
            : '!rounded-2xl max-h-[90vh]'
        )}
        onInteractOutside={(e) => {
          if (isSubmitting) e.preventDefault()
        }}
      >
        <DialogTitle className="sr-only">
          {t('applications.apply.title')}
        </DialogTitle>
        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <ApplicationFormState
              key="form"
              taskTitle={taskTitle}
              taskBudget={taskBudget}
              isMobile={isMobile}
              isKeyboardOpen={isKeyboardOpen}
              isSubmitting={isSubmitting}
              showNotificationWarning={showNotificationWarning && !bannerDismissed}
              onDismissNotificationBanner={() => setBannerDismissed(true)}
              onSetupNotifications={handleSetupNotifications}
              onClose={handleClose}
              onSubmit={handleSubmit}
              error={error}
              alreadyApplied={alreadyApplied}
            />
          ) : (
            <ApplicationSuccessState
              key="success"
              isMobile={isMobile}
              onViewApplication={handleViewApplication}
              onBrowseOther={handleBrowseOther}
            />
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
