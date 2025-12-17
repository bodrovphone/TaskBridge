'use client'

import { useState, useCallback, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, X, Check } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export interface WizardStep {
  id: string
  title: string
  subtitle?: string
  icon?: ReactNode
  content: ReactNode
  isOptional?: boolean
  canSkip?: boolean
  /** Validation function - return true if step is valid */
  isValid?: () => boolean
}

export interface WizardDialogProps {
  /** Array of steps to display */
  steps: WizardStep[]
  /** Called when wizard is completed */
  onComplete: () => void
  /** Called when wizard is cancelled/closed */
  onClose: () => void
  /** Whether the wizard is currently submitting */
  isSubmitting?: boolean
  /** Custom submit button text */
  submitText?: string
  /** Whether on mobile device */
  isMobile?: boolean
  /** Header gradient color classes */
  headerGradient?: string
  /** Header icon */
  headerIcon?: ReactNode
  /** Main title shown in header */
  title: string
  /** Subtitle shown in header */
  subtitle?: string
  /** Error message to display */
  error?: string | null
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 100 : -100,
    opacity: 0,
  }),
}

export function WizardDialog({
  steps,
  onComplete,
  onClose,
  isSubmitting = false,
  submitText,
  isMobile = false,
  headerGradient = 'from-blue-600 to-blue-500',
  headerIcon,
  title,
  subtitle,
  error,
}: WizardDialogProps) {
  const t = useTranslations()
  const [currentStep, setCurrentStep] = useState(0)
  const [direction, setDirection] = useState(0)

  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === steps.length - 1
  const currentStepData = steps[currentStep]

  // Check if current step is valid
  const isCurrentStepValid = currentStepData?.isValid?.() ?? true

  const goToNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setDirection(1)
      setCurrentStep((prev) => prev + 1)
    }
  }, [currentStep, steps.length])

  const goToPrevious = useCallback(() => {
    if (currentStep > 0) {
      setDirection(-1)
      setCurrentStep((prev) => prev - 1)
    }
  }, [currentStep])

  const handleNext = () => {
    if (isLastStep) {
      onComplete()
    } else {
      goToNext()
    }
  }

  return (
    <motion.div
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
          'flex-shrink-0 bg-gradient-to-r text-white px-5 py-4 sm:px-6 sm:py-5',
          headerGradient
        )}
      >
        <div className="flex items-start gap-3">
          {headerIcon && !isMobile && (
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              {headerIcon}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-white">
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-white/80 mt-0.5 line-clamp-2">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            aria-label={t('common.close')}
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mt-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                  index < currentStep
                    ? 'bg-white text-blue-600'
                    : index === currentStep
                      ? 'bg-white/30 text-white ring-2 ring-white'
                      : 'bg-white/10 text-white/50'
                )}
              >
                {index < currentStep ? (
                  <Check className="w-4 h-4" />
                ) : (
                  index + 1
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'w-8 h-0.5 mx-1',
                    index < currentStep ? 'bg-white' : 'bg-white/20'
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step title bar */}
      <div className="flex-shrink-0 px-5 py-3 sm:px-6 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-2">
          {currentStepData?.icon}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              {currentStepData?.title}
            </h3>
            {currentStepData?.subtitle && (
              <p className="text-xs text-gray-500">{currentStepData.subtitle}</p>
            )}
          </div>
          {currentStepData?.isOptional && (
            <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
              {t('common.optional')}
            </span>
          )}
        </div>
      </div>

      {/* Body with step content */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6 sm:py-5">
        {/* Error alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4"
          >
            <p className="text-sm font-medium text-red-800 dark:text-red-200">
              {error}
            </p>
          </motion.div>
        )}

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
          >
            {currentStepData?.content}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer with navigation */}
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
            onClick={isFirstStep ? onClose : goToPrevious}
            disabled={isSubmitting}
            className="flex-1 font-medium h-11 gap-1"
          >
            {isFirstStep ? (
              t('common.cancel')
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                {t('wizard.back')}
              </>
            )}
          </Button>
          <Button
            type="button"
            onClick={handleNext}
            disabled={!isCurrentStepValid || isSubmitting}
            className={cn(
              'flex-1 font-medium h-11 gap-1',
              isLastStep && isCurrentStepValid && 'bg-green-600 hover:bg-green-700 text-white'
            )}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                />
                {t('submitting')}
              </span>
            ) : isLastStep ? (
              <>
                {submitText || t('wizard.submit')}
                <Check className="w-4 h-4" />
              </>
            ) : (
              <>
                {t('wizard.next')}
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

export default WizardDialog
