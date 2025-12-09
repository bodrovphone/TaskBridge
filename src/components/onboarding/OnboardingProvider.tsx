'use client'

import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { useOnboarding, type TourId } from '@/hooks/use-onboarding'
import { useAuth } from '@/features/auth'
import { useIsMobile } from '@/hooks/use-is-mobile'
import { WelcomePrompt } from './WelcomePrompt'
import { RoleChoiceModal } from './RoleChoiceModal'
import { TourOverlay } from './TourOverlay'
import {
  getCurrentTourStep,
  getTotalApplicableSteps,
  type TourStepConfig,
} from './tours/tour-config'

interface OnboardingContextType {
  startTour: (tourId: TourId) => void
  restartTour: () => void // Reset and show role choice
  stopTour: () => void
  isOnboarding: boolean // True when any part of onboarding flow is active (prompt, role choice, or tour)
}

const OnboardingContext = createContext<OnboardingContextType>({
  startTour: () => {},
  restartTour: () => {},
  stopTour: () => {},
  isOnboarding: false,
})

export function useOnboardingContext() {
  return useContext(OnboardingContext)
}

interface OnboardingProviderWrapperProps {
  children: React.ReactNode
}

export function OnboardingProviderWrapper({
  children,
}: OnboardingProviderWrapperProps) {
  const { t, i18n } = useTranslation()
  const pathname = usePathname()
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  const isMobile = useIsMobile('lg')

  const isAuthenticated = !!user && !authLoading
  const hasProfessionalProfile = !!profile?.professionalTitle

  const {
    state,
    isHydrated,
    shouldShowWelcomePrompt,
    markWelcomePromptShown,
    startTour: startTourFromHook,
    stopTour: stopTourFromHook,
    completeTour,
    nextStep,
    prevStep,
    currentStepIndex,
    activeTourId,
    isTourActive,
  } = useOnboarding()

  const [showWelcomePrompt, setShowWelcomePrompt] = useState(false)
  const [showRoleChoice, setShowRoleChoice] = useState(false)

  // Current tour context for step calculations
  // NOTE: isAuthenticated is not needed since tours only launch for authenticated users
  const tourContext = useMemo(
    () => ({
      hasProfessionalProfile,
      pathname,
      isMobile,
    }),
    [hasProfessionalProfile, pathname, isMobile]
  )

  // Get current step based on tour state and context
  const currentStep = useMemo<TourStepConfig | null>(() => {
    if (!activeTourId || !isTourActive) return null
    return getCurrentTourStep(activeTourId, currentStepIndex, tourContext)
  }, [activeTourId, isTourActive, currentStepIndex, tourContext])

  // Get total steps for progress indicator
  const totalSteps = useMemo(() => {
    if (!activeTourId) return 0
    return getTotalApplicableSteps(activeTourId, tourContext)
  }, [activeTourId, tourContext])

  // Show welcome prompt for new authenticated users
  useEffect(() => {
    if (isHydrated && isAuthenticated && shouldShowWelcomePrompt) {
      const timer = setTimeout(() => {
        setShowWelcomePrompt(true)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [isHydrated, isAuthenticated, shouldShowWelcomePrompt])


  // Handle navigation for steps that need it
  useEffect(() => {
    if (!currentStep?.navigateTo) return

    // Check if we're already on the target page
    if (!pathname.includes(currentStep.navigateTo)) {
      // Extract lang from current pathname, with i18n fallback
      const langMatch = pathname.match(/^\/([a-z]{2})\//)
      // Priority: pathname locale > i18n.language > 'en' (never default to 'bg' silently)
      const lang = langMatch ? langMatch[1] : (i18n.language || 'en')
      router.push(`/${lang}${currentStep.navigateTo}`)
    }
  }, [currentStep, pathname, router, i18n.language])

  const handleWelcomeAccept = useCallback(() => {
    setShowWelcomePrompt(false)
    markWelcomePromptShown()
    setShowRoleChoice(true)
  }, [markWelcomePromptShown])

  const handleWelcomeDecline = useCallback(() => {
    setShowWelcomePrompt(false)
    markWelcomePromptShown()
  }, [markWelcomePromptShown])

  const handleRoleSelect = useCallback((choice: TourId) => {
    setShowRoleChoice(false)
    startTourFromHook(choice)
  }, [startTourFromHook])

  const handleNextStep = useCallback(() => {
    // Check if this is the last applicable step
    const nextStepConfig = getCurrentTourStep(
      activeTourId!,
      currentStepIndex + 1,
      tourContext
    )

    if (!nextStepConfig) {
      // Tour complete
      completeTour()
    } else {
      nextStep()
    }
  }, [activeTourId, currentStepIndex, tourContext, completeTour, nextStep])

  const handlePrevStep = useCallback(() => {
    prevStep()
  }, [prevStep])

  const handleStopTour = useCallback(() => {
    stopTourFromHook()
  }, [stopTourFromHook])

  // Manual tour start from Help menu
  const startTour = useCallback((tourId: TourId) => {
    startTourFromHook(tourId)
  }, [startTourFromHook])

  // Restart tour - stop any active tour and show role choice
  const restartTour = useCallback(() => {
    stopTourFromHook()
    setShowRoleChoice(true)
  }, [stopTourFromHook])

  // isOnboarding is true when ANY part of onboarding flow is active:
  // - Welcome prompt is showing
  // - Role choice modal is showing
  // - Tour is active
  const isOnboardingFlowActive = showWelcomePrompt || showRoleChoice || isTourActive

  const contextValue = useMemo(
    () => ({
      startTour,
      restartTour,
      stopTour: handleStopTour,
      isOnboarding: isOnboardingFlowActive,
    }),
    [startTour, restartTour, handleStopTour, isOnboardingFlowActive]
  )

  // Get selector and content based on element visibility (desktop vs mobile)
  const [currentSelector, setCurrentSelector] = useState('')
  const [isUsingMobileSelector, setIsUsingMobileSelector] = useState(false)

  useEffect(() => {
    if (!currentStep) {
      setCurrentSelector('')
      setIsUsingMobileSelector(false)
      return
    }

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      // Check if desktop element is visible
      const desktopElement = document.querySelector(currentStep.selector)
      const isDesktopVisible = desktopElement &&
        window.getComputedStyle(desktopElement).display !== 'none' &&
        desktopElement.getBoundingClientRect().width > 0

      if (isDesktopVisible) {
        setCurrentSelector(currentStep.selector)
        setIsUsingMobileSelector(false)
      } else if (currentStep.selectorMobile) {
        setCurrentSelector(currentStep.selectorMobile)
        setIsUsingMobileSelector(true)
      } else {
        setCurrentSelector(currentStep.selector)
        setIsUsingMobileSelector(false)
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [currentStep])

  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}

      {/* Welcome Prompt Modal */}
      <WelcomePrompt
        isOpen={showWelcomePrompt}
        onAccept={handleWelcomeAccept}
        onDecline={handleWelcomeDecline}
      />

      {/* Role Choice Modal */}
      <RoleChoiceModal
        isOpen={showRoleChoice}
        onSelect={handleRoleSelect}
      />

      {/* Tour Overlay */}
      <TourOverlay
        isVisible={isTourActive && !!currentStep}
        selector={currentSelector}
        icon={currentStep?.icon}
        title={currentStep ? t(currentStep.title) : ''}
        content={currentStep ? t(
          isUsingMobileSelector && currentStep.contentMobile
            ? currentStep.contentMobile
            : currentStep.content
        ) : ''}
        side={isUsingMobileSelector && currentStep?.sideMobile
          ? currentStep.sideMobile
          : (currentStep?.side || 'bottom')}
        currentStep={currentStepIndex + 1}
        totalSteps={totalSteps}
        onNext={handleNextStep}
        onPrev={handlePrevStep}
        onStop={handleStopTour}
      />
    </OnboardingContext.Provider>
  )
}
