'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from '@tanstack/react-form'
import { motion } from 'framer-motion'

import { DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { NotificationSetupChip } from '@/components/ui/notification-setup-chip'
import { cn } from '@/lib/utils'

import {
  Wallet,
  Clock,
  Sparkles,
  Calendar,
  Zap,
  ArrowRight,
  AlertCircle,
  X,
  Loader2,
} from 'lucide-react'

import { TIMELINE_OPTIONS } from '../types'
import {
  containsPhoneNumber,
  containsUrl,
  containsEmail,
  MESSAGE_MAX_LENGTH,
} from './validation'
import type { ApplicationFormData } from '../types'

// Timeline display translation keys
const TIMELINE_DISPLAY = {
  today: 'application.timelineToday',
  'within-3-days': 'application.timeline3days',
  'within-week': 'application.timelineWeek',
  flexible: 'application.timelineFlexible',
} as const

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
 * Application form state component (Radix UI version).
 * Handles the form UI for submitting task applications.
 */
export function ApplicationFormState({
  taskTitle,
  taskBudget,
  isMobile,
  isKeyboardOpen,
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
  const bodyRef = useRef<HTMLDivElement>(null)

  const form = useForm({
    defaultValues: {
      proposedPrice: undefined as number | undefined,
      timeline: '',
      message: '',
    },
    onSubmit: async ({ value }) => {
      await onSubmit({
        proposedPrice: value.proposedPrice ?? 0,
        timeline: value.timeline,
        message: value.message,
      })
    },
  })

  // Track form values for button state
  const [formValues, setFormValues] = useState<{
    proposedPrice: number | undefined
    timeline: string
    message: string
  }>({
    proposedPrice: undefined,
    timeline: '',
    message: '',
  })

  useEffect(() => {
    const unsubscribe = form.store.subscribe(() => {
      setFormValues(form.state.values)
    })
    return unsubscribe
  }, [form.store, form.state.values])

  // Handle input focus on mobile - scroll into view
  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (isMobile && bodyRef.current) {
      setTimeout(() => {
        e.target.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 300)
    }
  }

  // Character count for message
  const messageLength = formValues.message?.length || 0
  const messageProgress = (messageLength / MESSAGE_MAX_LENGTH) * 100

  // Form validation state
  const hasTimeline = formValues.timeline.length > 0
  const hasValidPrice = formValues.proposedPrice !== undefined && formValues.proposedPrice >= 0
  const hasValidMessage =
    messageLength <= MESSAGE_MAX_LENGTH &&
    !containsPhoneNumber(formValues.message || '') &&
    !containsUrl(formValues.message || '') &&
    !containsEmail(formValues.message || '')

  const isFormValid = hasValidPrice && hasTimeline && hasValidMessage

  // Button variant based on form state
  const getButtonVariant = () => {
    if (alreadyApplied) return 'outline'
    if (isFormValid) return 'default'
    return 'outline'
  }

  return (
    <motion.div
      key="form"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex flex-col h-full bg-white dark:bg-gray-900 overflow-hidden',
        !isMobile && 'rounded-2xl'
      )}
    >
      {/* Header */}
      <div
        className={cn(
          'flex-shrink-0 bg-gradient-to-r from-blue-600 to-blue-500 text-white',
          // No border-radius needed - parent's overflow-hidden clips the corners
          isMobile && isKeyboardOpen ? 'px-4 py-3' : 'px-5 py-4 sm:px-6 sm:py-5'
        )}
      >
        <div className="flex items-start gap-3">
          {!isMobile && (
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <DialogTitle className="text-lg sm:text-xl font-bold !text-white">
              {t('application.title')}
            </DialogTitle>
            {!(isMobile && isKeyboardOpen) && (
              <p className="text-sm text-white/80 mt-0.5 line-clamp-2">
                {taskTitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            aria-label={t('application.cancel')}
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div
        ref={bodyRef}
        className={cn(
          'flex-1 overflow-y-auto overscroll-contain',
          isMobile && isKeyboardOpen ? 'px-4 py-3' : 'px-5 py-4 sm:px-6 sm:py-5'
        )}
      >
        <form
          id="application-form"
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
          className="space-y-5 relative"
        >
          {/* Loading overlay */}
          {isSubmitting && (
            <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 z-50 flex items-center justify-center rounded-lg">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('application.submitting')}
                </p>
              </div>
            </div>
          )}

          {/* Error alert */}
          {error && <AlertBanner variant="error" message={error} />}

          {/* Already applied warning */}
          {alreadyApplied && <AlertBanner variant="warning" message={t('application.alreadyApplied')} />}

          {/* Notification setup chip */}
          {showNotificationWarning && !(isMobile && isKeyboardOpen) && (
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

          {/* Proposed Price Field */}
          <form.Field
            name="proposedPrice"
            validators={{
              onChange: ({ value }) => {
                if (value === undefined) return t('application.errors.priceRequired')
                if (value < 0) return t('application.errors.priceMin')
                return undefined
              },
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="proposedPrice" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('application.proposedPrice')} <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="proposedPrice"
                    placeholder={t('application.pricePlaceholder')}
                    type="number"
                    min="0"
                    step="0.01"
                    value={field.state.value === undefined ? '' : field.state.value.toString()}
                    onChange={(e) => {
                      const val = e.target.value
                      field.handleChange(val === '' ? undefined : parseFloat(val))
                    }}
                    onBlur={field.handleBlur}
                    onFocus={handleInputFocus}
                    disabled={isSubmitting}
                    className={cn(
                      'h-12 pr-14 text-base rounded-xl',
                      field.state.meta.errors.length > 0 && 'border-red-500 focus:ring-red-500'
                    )}
                    style={{ fontSize: '16px' }}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">
                    BGN
                  </span>
                </div>
                {field.state.meta.errors.length > 0 && (
                  <p className="text-xs text-red-500">{String(field.state.meta.errors[0])}</p>
                )}
                {taskBudget && (taskBudget.min !== undefined || taskBudget.max !== undefined) && !(isMobile && isKeyboardOpen) && (
                  <BudgetHint min={taskBudget.min ?? 0} max={taskBudget.max ?? 0} t={t} />
                )}
              </div>
            )}
          </form.Field>

          {/* Timeline Field */}
          <form.Field
            name="timeline"
            validators={{
              onChange: ({ value }) => {
                if (!value || value.length === 0) return t('application.errors.timelineRequired')
                return undefined
              },
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="timeline" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('application.timeline')} <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={field.state.value}
                  onValueChange={(value) => field.handleChange(value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger
                    id="timeline"
                    className={cn(
                      'h-14 rounded-xl bg-white dark:bg-gray-900',
                      field.state.meta.errors.length > 0 && 'border-red-500 focus:ring-red-500'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <SelectValue placeholder={t('application.timeline')} />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                    {TIMELINE_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option} className="hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <TimelineIcon option={option} />
                          <span>{t(TIMELINE_DISPLAY[option])}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {field.state.meta.errors.length > 0 && (
                  <p className="text-xs text-red-500">{String(field.state.meta.errors[0])}</p>
                )}
              </div>
            )}
          </form.Field>

          {/* Message Field */}
          <form.Field
            name="message"
            validators={{
              onChange: ({ value }) => {
                if (value && value.length > MESSAGE_MAX_LENGTH) return t('application.errors.messageMax')
                if (value && containsPhoneNumber(value)) return t('application.errors.noPhoneNumbers')
                if (value && containsUrl(value)) return t('application.errors.noUrls')
                if (value && containsEmail(value)) return t('application.errors.noEmails')
                return undefined
              },
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="message" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('application.message')}{' '}
                  <span className="text-gray-400 font-normal">({t('common.optional', 'Optional')})</span>
                </Label>
                <Textarea
                  id="message"
                  placeholder={t('application.messagePlaceholder')}
                  value={field.state.value || ''}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  onFocus={handleInputFocus}
                  disabled={isSubmitting}
                  rows={isKeyboardOpen ? 2 : 4}
                  className={cn(
                    'text-base rounded-xl resize-none',
                    field.state.meta.errors.length > 0 && 'border-red-500 focus:ring-red-500'
                  )}
                  style={{ fontSize: '16px' }}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-xs text-red-500">{String(field.state.meta.errors[0])}</p>
                )}
                {!(isMobile && isKeyboardOpen) && (
                  <>
                    <CharacterCounter
                      current={messageLength}
                      max={MESSAGE_MAX_LENGTH}
                      progress={messageProgress}
                      t={t}
                    />
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        {t('application.messageInfo')}
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </form.Field>
        </form>
      </div>

      {/* Footer */}
      <div
        className={cn(
          'flex-shrink-0 border-t border-gray-100 bg-gray-50 dark:bg-gray-800',
          isMobile ? 'px-4 py-3 pb-safe rounded-none' : 'px-5 py-4 sm:px-6 rounded-b-xl'
        )}
      >
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 font-medium h-11"
          >
            {t('application.cancel')}
          </Button>
          <Button
            type="submit"
            form="application-form"
            variant={getButtonVariant()}
            disabled={alreadyApplied || !isFormValid || isSubmitting}
            className={cn(
              'flex-1 font-medium h-11 gap-2',
              isFormValid && !alreadyApplied && 'bg-green-600 hover:bg-green-700 text-white'
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('application.submitting')}
              </>
            ) : (
              <>
                {t('application.submit')}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

// --- Helper Components ---

function AlertBanner({ variant, message }: { variant: 'error' | 'warning'; message: string }) {
  const isError = variant === 'error'
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'border rounded-xl p-4 flex items-start gap-3',
        isError
          ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
      )}
    >
      <AlertCircle
        className={cn(
          'w-5 h-5 flex-shrink-0 mt-0.5',
          isError ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'
        )}
      />
      <p
        className={cn(
          'text-sm font-medium',
          isError ? 'text-red-800 dark:text-red-200' : 'text-yellow-800 dark:text-yellow-200'
        )}
      >
        {message}
      </p>
    </motion.div>
  )
}

function BudgetHint({ min, max, t }: { min: number; max: number; t: (key: string, opts?: Record<string, unknown>) => string }) {
  return (
    <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-3 flex items-start gap-2">
      <Wallet className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
      <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 font-medium leading-relaxed">
        {t('application.tipClientBudget', { min, max })}
      </p>
    </div>
  )
}

function TimelineIcon({ option }: { option: string }) {
  switch (option) {
    case 'today':
      return <Zap className="w-4 h-4 text-orange-500" />
    case 'within-3-days':
      return <Clock className="w-4 h-4 text-blue-500" />
    case 'within-week':
      return <Calendar className="w-4 h-4 text-green-500" />
    default:
      return <Sparkles className="w-4 h-4 text-purple-500" />
  }
}

function CharacterCounter({
  current,
  max,
  progress,
  t,
}: {
  current: number
  max: number
  progress: number
  t: (key: string, opts?: Record<string, unknown>) => string
}) {
  return (
    <div className="flex items-center justify-between">
      <span
        className={cn(
          'text-xs font-medium transition-colors',
          current > max ? 'text-red-500' : 'text-gray-400'
        )}
      >
        {t('application.characterCount', { current, max })}
      </span>
      {current > 0 && (
        <div className="w-24 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className={cn('h-full rounded-full', current > max ? 'bg-red-500' : 'bg-blue-600')}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>
      )}
    </div>
  )
}
