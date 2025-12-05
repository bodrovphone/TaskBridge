/**
 * Shared modal configuration for application dialogs.
 * Provides consistent mobile/desktop behavior across the application.
 */

/**
 * Get modal motion variants based on device type
 */
export function getModalMotionProps(isMobile: boolean) {
  if (isMobile) {
    return {
      variants: {
        enter: {
          x: 0,
          opacity: 1,
          transition: {
            duration: 0.3,
            ease: 'easeOut',
          },
        },
        exit: {
          x: '100%',
          opacity: 0,
          transition: {
            duration: 0.2,
            ease: 'easeIn',
          },
        },
      },
    }
  }

  return {
    variants: {
      enter: {
        y: 0,
        opacity: 1,
        transition: {
          duration: 0.3,
          ease: 'easeOut',
        },
      },
      exit: {
        y: -20,
        opacity: 0,
        transition: {
          duration: 0.2,
          ease: 'easeIn',
        },
      },
    },
  }
}

/**
 * Get modal class names based on device type and keyboard state
 */
export function getModalClassNames(isMobile: boolean, isKeyboardOpen: boolean) {
  return {
    backdrop: 'bg-black/80',
    wrapper: isMobile ? 'items-stretch' : '',
    base: isMobile
      ? 'h-full max-h-full w-full m-0 rounded-none border-0'
      : `border border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800 ${
          isKeyboardOpen ? 'max-h-[60vh]' : 'max-h-[95vh]'
        } sm:max-h-[90vh] my-auto transition-all duration-200`,
    header:
      'border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10 bg-white dark:bg-gray-900 px-4 py-2 sm:px-6 sm:py-4',
    body: 'overflow-y-auto overscroll-contain px-4 py-3 sm:px-6 sm:py-4',
    footer:
      'border-t border-gray-200 dark:border-gray-800 sticky bottom-0 z-10 bg-white dark:bg-gray-900 px-4 py-3 sm:px-6 sm:py-4',
  }
}

/**
 * Timeline to estimated hours mapping for API submission
 *
 * @todo REFACTORING: This mapping is semantically incorrect. The UI asks "When can you start?"
 * (availability) but we store it as `estimated_duration_hours` (duration). These hour values
 * are arbitrary and meaningless. Should be refactored to store the timeline string directly
 * as `proposed_timeline` (TEXT). See: todo_tasks/refactor-timeline-to-proposed-timeline.md
 */
export const TIMELINE_HOURS_MAP: Record<string, number> = {
  today: 8,
  'within-3-days': 24,
  'within-week': 40,
  flexible: 80,
}
