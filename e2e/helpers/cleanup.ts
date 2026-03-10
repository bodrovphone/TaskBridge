/**
 * E2E Cleanup Helper
 *
 * Calls the internal cleanup API to delete test users before tests run,
 * ensuring a fresh state for registration and task creation flows.
 */

const BASE_URL = process.env.BASE_URL || 'https://trudify.com'
const CLEANUP_SECRET = process.env.E2E_CLEANUP_SECRET

export async function cleanupE2EUsers(emails: string[]): Promise<void> {
  if (!CLEANUP_SECRET) {
    console.warn('[E2E Cleanup] E2E_CLEANUP_SECRET not set, skipping cleanup')
    return
  }

  try {
    const response = await fetch(`${BASE_URL}/api/internal/e2e-cleanup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-cleanup-secret': CLEANUP_SECRET,
      },
      body: JSON.stringify({ emails }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('[E2E Cleanup] Failed:', response.status, data)
      return
    }

    for (const result of data.results) {
      if (result.deleted) {
        console.log(`[E2E Cleanup] Deleted ${result.email}:`, result.details)
      } else {
        console.log(`[E2E Cleanup] Skipped ${result.email}: ${result.error}`)
      }
    }
  } catch (error) {
    console.error('[E2E Cleanup] Error:', error)
  }
}
