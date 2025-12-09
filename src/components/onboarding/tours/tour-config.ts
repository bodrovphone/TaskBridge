import type { TourId } from '@/hooks/use-onboarding'

export interface TourStepConfig {
  id: string
  // Conditions for when this step should show
  // NOTE: No requiresAuth since tours only launch for authenticated users
  requiresProfessionalProfile?: boolean // true = must have professional_title, false = must NOT have
  requiresPage?: string // pathname must include this
  // Step content
  selector: string // CSS selector for element to highlight
  selectorMobile?: string // Alternative selector for mobile (e.g., hamburger icon)
  contentMobile?: string // Alternative content translation key for mobile
  title: string // Translation key
  content: string // Translation key
  icon: string // Emoji
  side: 'top' | 'bottom' | 'left' | 'right'
  sideMobile?: 'top' | 'bottom' | 'left' | 'right' // Alternative side for mobile
  // Actions
  navigateTo?: string // Navigate to this path before showing step
}

export interface TourConfig {
  id: TourId
  steps: TourStepConfig[]
}

/**
 * Professional Tour Steps
 *
 * NOTE: Tour only launches for authenticated users (after registration),
 * so there's no need for "auth required" steps.
 *
 * Flow:
 * 1. No professional title → "Complete profile" → profile page
 * 2. Has title → "Find work" → browse tasks nav item
 * 3. On browse-tasks → "Use filters"
 * 4. On browse-tasks → "Click task card"
 */
export const professionalTourConfig: TourConfig = {
  id: 'professional',
  steps: [
    // Step for users without professional profile yet
    {
      id: 'complete-profile',
      requiresProfessionalProfile: false,
      selector: '#nav-user-menu',
      selectorMobile: '#mobile-nav-user-menu',
      title: 'onboarding.professional.completeProfile.title',
      content: 'onboarding.professional.completeProfile.content',
      icon: '👤',
      side: 'bottom',
      sideMobile: 'left',
      navigateTo: '/profile/professional',
    },
    // Step for professionals - find work
    {
      id: 'find-work',
      requiresProfessionalProfile: true,
      selector: '#nav-browse-tasks',
      selectorMobile: '#mobile-menu-toggle',
      title: 'onboarding.professional.findWork.title',
      content: 'onboarding.professional.findWork.content',
      contentMobile: 'onboarding.professional.findWork.contentMobile',
      icon: '🔍',
      side: 'bottom',
      sideMobile: 'left',
    },
    // On browse-tasks page - filters
    {
      id: 'use-filters',
      requiresProfessionalProfile: true,
      requiresPage: '/browse-tasks',
      selector: '#task-filters',
      title: 'onboarding.professional.useFilters.title',
      content: 'onboarding.professional.useFilters.content',
      icon: '🎯',
      side: 'bottom',
    },
    // On browse-tasks page - task card
    {
      id: 'click-task',
      requiresProfessionalProfile: true,
      requiresPage: '/browse-tasks',
      selector: '#task-card-example',
      title: 'onboarding.professional.clickTask.title',
      content: 'onboarding.professional.clickTask.content',
      icon: '📋',
      side: 'top',
    },
  ],
}

/**
 * Customer Tour Steps
 *
 * NOTE: Tour only launches for authenticated users (after registration),
 * so there's no need for "auth required" steps.
 *
 * Flow:
 * 1. "Post a task" → create task button
 */
export const customerTourConfig: TourConfig = {
  id: 'customer',
  steps: [
    // Single step - show how to create a task
    {
      id: 'create-task',
      selector: '#nav-create-task',
      selectorMobile: '#mobile-menu-toggle',
      title: 'onboarding.customer.createTask.title',
      content: 'onboarding.customer.createTask.content',
      contentMobile: 'onboarding.customer.createTask.contentMobile',
      icon: '📝',
      side: 'bottom',
      sideMobile: 'left',
    },
  ],
}

export const tourConfigs: Record<TourId, TourConfig> = {
  professional: professionalTourConfig,
  customer: customerTourConfig,
}

/**
 * Get the current applicable step for a tour based on user state
 *
 * NOTE: Since tours only launch for authenticated users, we don't check
 * for authentication status - only professional profile status and page.
 */
export function getCurrentTourStep(
  tourId: TourId,
  stepIndex: number,
  context: {
    hasProfessionalProfile: boolean
    pathname: string
    isMobile: boolean
  }
): TourStepConfig | null {
  const config = tourConfigs[tourId]
  if (!config) return null

  // Find all steps that match current conditions
  const applicableSteps = config.steps.filter((step) => {
    // Check professional profile requirement
    if (step.requiresProfessionalProfile === true && !context.hasProfessionalProfile) return false
    if (step.requiresProfessionalProfile === false && context.hasProfessionalProfile) return false

    // Check page requirement
    if (step.requiresPage && !context.pathname.includes(step.requiresPage)) return false

    return true
  })

  // Return the step at the current index, or null if we've completed all steps
  return applicableSteps[stepIndex] || null
}

/**
 * Get total number of applicable steps for progress indicator
 */
export function getTotalApplicableSteps(
  tourId: TourId,
  context: {
    hasProfessionalProfile: boolean
    pathname: string
  }
): number {
  const config = tourConfigs[tourId]
  if (!config) return 0

  return config.steps.filter((step) => {
    if (step.requiresProfessionalProfile === true && !context.hasProfessionalProfile) return false
    if (step.requiresProfessionalProfile === false && context.hasProfessionalProfile) return false
    // Don't filter by page for total count - we want to show progress across pages
    return true
  }).length
}
