import { test, expect } from '@playwright/test'
import { FLOW_SELECTORS, E2E_USERS } from '../helpers/constants'
import { cleanupE2EUsers } from '../helpers/cleanup'

/**
 * Full professional registration flow.
 *
 * 1. Cleans up any previous test account via /api/internal/e2e-cleanup
 * 2. Registers a fresh professional via deep link + sign up + onboarding
 * 3. Verifies the profile appears in filtered listings
 *
 * Uses city=sliven + category=plumber for predictable filtered results.
 */
test.describe('Professional Registration Flow @flow', () => {
  test.setTimeout(120_000)

  const { email, password, name, title } = E2E_USERS.professional

  test.beforeAll(async () => {
    await cleanupE2EUsers([email])
  })

  test.afterAll(async () => {
    await cleanupE2EUsers([email])
  })

  test('register as professional, verify listing', async ({ page }) => {
    // Step 1: Navigate to deep link
    // intent=professional skips step 1 (intent selector), lands on step 2 (professional info)
    // categories=plumber pre-fills the category, city=sliven pre-fills the city
    await page.goto('/en/register?intent=professional&categories=plumber&city=sliven', {
      waitUntil: 'domcontentloaded',
    })

    await expect(page.locator('body')).not.toContainText('Internal Server Error')

    // Step 2: Complete professional info
    const professionInput = page.getByRole('textbox').first()
    await expect(professionInput).toBeVisible({ timeout: 10000 })

    // Deep link may pre-fill some fields. Fill title if empty.
    const currentTitle = await professionInput.inputValue()
    if (!currentTitle || currentTitle.length < 3) {
      await professionInput.fill(title)
    }

    // Click Continue to proceed to auth step (step 3)
    const continueButton = page.getByRole('button', { name: /continue|next|proceed/i })
    await expect(continueButton).toBeVisible({ timeout: 5000 })
    await continueButton.click()

    // Step 3: Auth form (email, password, name)
    const emailInput = page.locator(FLOW_SELECTORS.emailInput)
    await expect(emailInput).toBeVisible({ timeout: 10000 })
    await emailInput.fill(email)

    const passwordInput = page.locator(FLOW_SELECTORS.passwordInput)
    await passwordInput.fill(password)

    const nameInput = page.locator('input[type="text"]').last()
    await nameInput.fill(name)

    // Submit registration
    const submitButton = page.getByRole('button', { name: 'Continue', exact: true })
    await expect(submitButton).toBeEnabled()
    await submitButton.click()

    // Step 4: Wait for redirect to professional profile
    await expect(page).toHaveURL(/\/profile\/professional/, { timeout: 30000 })
    await expect(page.locator('body')).not.toContainText('Internal Server Error')

    // Step 5: Verify professional appears in filtered listings
    await page.goto('/en/professionals?category=plumber&city=sliven', {
      waitUntil: 'domcontentloaded',
    })

    await page.waitForTimeout(3000)

    // The new professional should appear in results (obfuscated name starts with "E2E")
    await expect(page.locator('body')).toContainText('E2E', { timeout: 15000 })
  })
})
