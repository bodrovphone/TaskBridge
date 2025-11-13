/**
 * Review Delay Configuration
 *
 * Controls the delay duration for delayed review publishing based on environment.
 * - Production: 7 days (1 week)
 * - Development/Staging: 1 day (for testing)
 */

/**
 * Get review publishing delay in milliseconds
 *
 * @returns Delay duration in milliseconds
 * - Production (trudify.com): 7 days (604800000 ms)
 * - Staging (task-bridge-chi.vercel.app): 1 day (86400000 ms)
 * - Development (localhost): 1 day (86400000 ms)
 */
export function getReviewPublishingDelay(): number {
  // Check if we're in development/staging environment
  const isDevelopment = process.env.NODE_ENV === 'development'
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || ''
  const isStaging = baseUrl.includes('task-bridge-chi.vercel.app')

  // Use 1 day for testing in dev/staging, 7 days in production
  if (isDevelopment || isStaging) {
    return 24 * 60 * 60 * 1000 // 1 day
  }

  return 7 * 24 * 60 * 60 * 1000 // 7 days (1 week)
}

/**
 * Get human-readable delay duration
 *
 * @returns Human-readable string like "1 week" or "1 day"
 */
export function getReviewDelayLabel(): string {
  const isDevelopment = process.env.NODE_ENV === 'development'
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || ''
  const isStaging = baseUrl.includes('task-bridge-chi.vercel.app')

  if (isDevelopment || isStaging) {
    return '1 day'
  }

  return '1 week'
}

/**
 * Calculate published_at timestamp for delayed review
 *
 * @param delayPublishing - Whether to delay publishing
 * @returns ISO timestamp string
 */
export function calculatePublishedAt(delayPublishing: boolean): string {
  const now = new Date()

  if (!delayPublishing) {
    return now.toISOString()
  }

  const delay = getReviewPublishingDelay()
  return new Date(now.getTime() + delay).toISOString()
}
