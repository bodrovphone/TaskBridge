import { test, expect } from '@playwright/test'
import { FLOW_SELECTORS } from '../helpers/constants'

/**
 * Full professional registration flow with cleanup.
 *
 * Creates a REAL user on production via deep link → sign up → onboarding,
 * then verifies the profile appears in filtered listings, and cleans up
 * by clearing the professional title (which removes them from listings).
 *
 * Uses city=sliven + category=plumber for predictable filtered results.
 */
test.describe('Professional Registration Flow @flow', () => {
  // Increase timeout — this flow involves real sign-up and multiple navigations
  test.setTimeout(120_000)

  const timestamp = Date.now()
  const testEmail = `bodrovphone+e2e+${timestamp}@gmail.com`
  const testPassword = 'E2eTest!2026secure'
  const testName = `E2E Tester ${timestamp}`
  const testTitle = 'Plumber' // Will be pre-filled by deep link category

  test('register as professional, verify listing, cleanup', async ({ page }) => {
    // ─── Step 1: Navigate to deep link ───
    // intent=professional skips step 1 (intent selector), lands on step 2 (professional info)
    // categories=plumber pre-fills the category, city=sliven pre-fills the city
    await page.goto('/en/register?intent=professional&categories=plumber&city=sliven', {
      waitUntil: 'domcontentloaded',
    })

    // Should be on professional info step (step 2)
    await expect(page.locator('body')).not.toContainText('Internal Server Error')

    // ─── Step 2: Complete professional info ───
    // Title input — fill professional title
    const titleInput = page.locator('input').filter({ hasText: '' }).first()
    // Look for the title/profession input by label or placeholder
    const professionInput = page.getByRole('textbox').first()
    await expect(professionInput).toBeVisible({ timeout: 10000 })

    // The deep link may pre-fill some fields. Fill title if empty.
    const currentTitle = await professionInput.inputValue()
    if (!currentTitle || currentTitle.length < 3) {
      await professionInput.fill(testTitle)
    }

    // City should be pre-filled from deep link (sliven)
    // Category should be pre-filled from deep link (plumber)
    // Click Continue to proceed to auth step (step 3)
    const continueButton = page.getByRole('button', { name: /continue|next|proceed/i })
    await expect(continueButton).toBeVisible({ timeout: 5000 })
    await continueButton.click()

    // ─── Step 3: Auth form (email, password, name) ───
    // Wait for email input to appear (auth step)
    const emailInput = page.locator(FLOW_SELECTORS.emailInput)
    await expect(emailInput).toBeVisible({ timeout: 10000 })

    // Fill registration form
    await emailInput.fill(testEmail)

    const passwordInput = page.locator(FLOW_SELECTORS.passwordInput)
    await passwordInput.fill(testPassword)

    // Fill name field
    const nameInput = page.locator('input[type="text"]').last()
    await nameInput.fill(testName)

    // Submit registration
    const submitButton = page.getByRole('button', { name: 'Continue', exact: true })
    await expect(submitButton).toBeEnabled()
    await submitButton.click()

    // ─── Step 4: Wait for redirect to professional profile ───
    // After successful registration, should redirect to /profile/professional
    await expect(page).toHaveURL(/\/profile\/professional/, { timeout: 30000 })

    // Profile page should load without errors
    await expect(page.locator('body')).not.toContainText('Internal Server Error')

    // ─── Step 5: Verify professional appears in filtered listings ───
    // Navigate to professionals page filtered by plumber + sliven
    // Client-side API fetch with query params bypasses ISR cache
    await page.goto('/en/professionals?category=plumber&city=sliven', {
      waitUntil: 'domcontentloaded',
    })

    // Wait for results to load
    await page.waitForTimeout(3000)

    // The new professional should appear in results
    // Look for the test name (obfuscated: first name + last initial)
    const expectedNamePart = 'E2E' // obfuscated name starts with "E2E"
    await expect(page.locator('body')).toContainText(expectedNamePart, { timeout: 15000 })

    // ─── Step 6: Cleanup — remove professional from listings ───
    // Navigate to professional profile edit page
    await page.goto('/en/profile/professional', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('body')).not.toContainText('Internal Server Error')

    // Find the Professional Identity section and click Edit
    const identitySection = page.locator('#professional-identity-section')
    await expect(identitySection).toBeVisible({ timeout: 10000 })

    const editButton = identitySection.getByRole('button', { name: /edit/i })
    await editButton.click()

    // Clear the professional title (this removes them from listings)
    const titleField = identitySection.locator('input').first()
    await expect(titleField).toBeVisible()
    await titleField.clear()

    // Set bio to cleanup marker
    const bioField = identitySection.locator('textarea')
    await expect(bioField).toBeVisible()
    await bioField.clear()
    await bioField.fill('E2E_TEST_CLEANUP')

    // Save changes
    const saveButton = identitySection.getByRole('button', { name: /save/i })
    await saveButton.click()

    // Wait for save to complete
    await page.waitForTimeout(2000)

    // ─── Step 7: Verify professional is removed from listings ───
    await page.goto('/en/professionals?category=plumber&city=sliven', {
      waitUntil: 'domcontentloaded',
    })

    await page.waitForTimeout(3000)

    // The test professional should no longer appear (title cleared = doesn't meet listing requirements)
    await expect(page.locator('body')).not.toContainText(expectedNamePart, { timeout: 10000 })
  })
})
