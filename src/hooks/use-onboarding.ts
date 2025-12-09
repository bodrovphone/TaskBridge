'use client'

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'trudify_onboarding'

export type TourId = 'customer' | 'professional'

export interface OnboardingState {
  welcomePromptShown: boolean
  tourAccepted: boolean
  initialChoice: TourId | null
  // Cross-page tour tracking
  activeTourId: TourId | null
  currentStepIndex: number
  // Completion flags
  customerTourCompleted: boolean
  professionalTourCompleted: boolean
}

const DEFAULT_STATE: OnboardingState = {
  welcomePromptShown: false,
  tourAccepted: false,
  initialChoice: null,
  activeTourId: null,
  currentStepIndex: 0,
  customerTourCompleted: false,
  professionalTourCompleted: false,
}

function getStoredState(): OnboardingState {
  if (typeof window === 'undefined') return DEFAULT_STATE
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? { ...DEFAULT_STATE, ...JSON.parse(stored) } : DEFAULT_STATE
  } catch {
    return DEFAULT_STATE
  }
}

function setStoredState(state: OnboardingState): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Ignore localStorage errors
  }
}

export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>(DEFAULT_STATE)
  const [isHydrated, setIsHydrated] = useState(false)

  // Hydrate state from localStorage after mount
  useEffect(() => {
    setState(getStoredState())
    setIsHydrated(true)
  }, [])

  const updateState = useCallback((updates: Partial<OnboardingState>) => {
    setState((prev) => {
      const newState = { ...prev, ...updates }
      setStoredState(newState)
      return newState
    })
  }, [])

  // Check if welcome prompt should be shown
  const shouldShowWelcomePrompt = isHydrated && !state.welcomePromptShown

  // Mark welcome prompt as shown
  const markWelcomePromptShown = useCallback(() => {
    updateState({ welcomePromptShown: true })
  }, [updateState])

  // Accept tour (user clicked "Yes, show me around")
  const acceptTour = useCallback((choice: 'customer' | 'professional') => {
    updateState({
      tourAccepted: true,
      initialChoice: choice,
    })
  }, [updateState])

  // Decline tour (user clicked "Maybe later")
  const declineTour = useCallback(() => {
    updateState({
      welcomePromptShown: true,
      tourAccepted: false,
    })
  }, [updateState])

  // Start a tour (from role choice or help menu)
  const startTour = useCallback(
    (tourId: TourId) => {
      updateState({
        welcomePromptShown: true,
        tourAccepted: true,
        initialChoice: tourId,
        activeTourId: tourId,
        currentStepIndex: 0,
      })
    },
    [updateState]
  )

  // Advance to next step
  const nextStep = useCallback(() => {
    updateState({ currentStepIndex: state.currentStepIndex + 1 })
  }, [state.currentStepIndex, updateState])

  // Go to previous step
  const prevStep = useCallback(() => {
    if (state.currentStepIndex > 0) {
      updateState({ currentStepIndex: state.currentStepIndex - 1 })
    }
  }, [state.currentStepIndex, updateState])

  // Go to specific step (for cross-page navigation)
  const goToStep = useCallback(
    (stepIndex: number) => {
      updateState({ currentStepIndex: stepIndex })
    },
    [updateState]
  )

  // Complete current tour
  const completeTour = useCallback(() => {
    const tourId = state.activeTourId
    updateState({
      activeTourId: null,
      currentStepIndex: 0,
      customerTourCompleted:
        tourId === 'customer' ? true : state.customerTourCompleted,
      professionalTourCompleted:
        tourId === 'professional' ? true : state.professionalTourCompleted,
    })
  }, [state.activeTourId, state.customerTourCompleted, state.professionalTourCompleted, updateState])

  // Stop/cancel tour without completing
  const stopTour = useCallback(() => {
    updateState({
      activeTourId: null,
      currentStepIndex: 0,
    })
  }, [updateState])

  // Check if a tour is active
  const isTourActive = isHydrated && state.activeTourId !== null

  // Reset all onboarding (for testing/debug)
  const resetOnboarding = useCallback(() => {
    const resetState = { ...DEFAULT_STATE }
    setState(resetState)
    setStoredState(resetState)
  }, [])

  return {
    state,
    isHydrated,
    // Welcome prompt
    shouldShowWelcomePrompt,
    markWelcomePromptShown,
    acceptTour,
    declineTour,
    // Tour control
    startTour,
    stopTour,
    completeTour,
    isTourActive,
    // Step navigation
    nextStep,
    prevStep,
    goToStep,
    currentStepIndex: state.currentStepIndex,
    activeTourId: state.activeTourId,
    // Reset
    resetOnboarding,
  }
}
