'use client'

import { Button } from '@nextui-org/react'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { LogoIcon } from '@/components/common/logo'

interface OnboardingCardProps {
  icon?: string
  title: string
  content: string
  currentStep: number
  totalSteps: number
  onNext: () => void
  onPrev: () => void
  onStop: () => void
  showNavigation?: boolean
}

export function OnboardingCard({
  icon,
  title,
  content,
  currentStep,
  totalSteps,
  onNext,
  onPrev,
  onStop,
  showNavigation = true,
}: OnboardingCardProps) {
  const { t } = useTranslation()
  const isLastStep = currentStep === totalSteps
  const isFirstStep = currentStep === 1

  return (
    <div className="relative bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden max-w-sm w-full z-[10000]">
      {/* Gradient header with logo */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LogoIcon size="sm" className="w-6 h-6" />
          <span className="text-white font-semibold text-sm">Trudify</span>
        </div>
        <button
          onClick={onStop}
          className="text-white/70 hover:text-white transition-colors"
          aria-label={t('onboarding.stopTour')}
        >
          <X size={18} />
        </button>
      </div>

      <div className="p-5">
        {/* Step indicator - only show if more than 1 step */}
        {totalSteps > 1 && (
          <div className="flex items-center gap-1.5 mb-3">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i + 1 <= currentStep
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 w-6'
                    : 'bg-gray-200 w-3'
                }`}
              />
            ))}
            <span className="ml-auto text-xs text-gray-400 font-medium">
              {currentStep}/{totalSteps}
            </span>
          </div>
        )}

        {/* Content */}
        <div className="mb-4">
          {icon && (
            <div className="text-3xl mb-2">{icon}</div>
          )}
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {title}
          </h3>
          <div className="text-sm text-gray-600 leading-relaxed">
            {content}
          </div>
        </div>

        {/* Navigation */}
        {showNavigation && (
          <div className="flex items-center gap-2">
            {!isFirstStep && (
              <Button
                variant="bordered"
                size="sm"
                onPress={onPrev}
                className="text-gray-700 border-gray-300 hover:bg-gray-50"
              >
                {t('onboarding.back')}
              </Button>
            )}
            <Button
              size="sm"
              onPress={onNext}
              className="ml-auto font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25"
            >
              {isLastStep ? t('onboarding.done') : t('onboarding.next')}
            </Button>
          </div>
        )}

        {/* Stop tour link */}
        <button
          onClick={onStop}
          className="w-full mt-3 text-xs text-gray-400 hover:text-blue-600 transition-colors"
        >
          {t('onboarding.stopTourLink')}
        </button>
      </div>
    </div>
  )
}
