/**
 * E2E Test User Detection
 *
 * Identifies test users by email pattern to suppress
 * notifications and other side effects during E2E test runs.
 */

/**
 * Check if an email belongs to an E2E test user.
 * Pattern: contains "+e2e+" in the email local part.
 */
export function isE2ETestEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return email.includes('+e2e+')
}
