import { test, expect } from '@playwright/test'
import { FLOW_SELECTORS, FLOW_DATA } from '../helpers/constants'

test.describe('Auth Pages @flow', () => {
  test.describe('Registration page', () => {
    test('renders intent selector with professional and customer options', async ({ page }) => {
      await page.goto('/en/register', { waitUntil: 'domcontentloaded' })

      // Intent selector cards should be visible (step 1)
      await expect(page.getByText('Professional', { exact: false }).first()).toBeVisible()
      await expect(page.getByText('Customer', { exact: false }).first()).toBeVisible()
    })

    test('customer intent leads to auth form', async ({ page }) => {
      // Use deep link to skip intent selector, go directly to auth step for customer
      await page.goto('/en/register?intent=customer', { waitUntil: 'domcontentloaded' })

      // Customer goes directly to step 2 (auth form) — should see email input
      await expect(page.locator(FLOW_SELECTORS.emailInput)).toBeVisible({ timeout: 5000 })
      await expect(page.locator(FLOW_SELECTORS.passwordInput)).toBeVisible()
    })

    test('pre-filled professional registration via deep link', async ({ page }) => {
      await page.goto('/en/register?intent=professional&city=sofia', {
        waitUntil: 'domcontentloaded',
      })

      // Should skip intent selector and land on professional info step (step 2)
      await expect(page.locator('body')).not.toContainText('Internal Server Error')

      // Professional info step has city and category fields
      await expect(page.getByText(/city|services|offer/i).first()).toBeVisible({ timeout: 5000 })
    })

    test('Google OAuth button is present on auth step', async ({ page }) => {
      // Customer deep link goes directly to auth form
      await page.goto('/en/register?intent=customer', {
        waitUntil: 'domcontentloaded',
      })

      // Google button should be visible on the auth step
      const googleButton = page.getByRole('button', { name: /google/i }).first()
      await expect(googleButton).toBeVisible({ timeout: 5000 })
    })
  })

  test.describe('Forgot password page', () => {
    test('renders email form', async ({ page }) => {
      await page.goto('/en/forgot-password', { waitUntil: 'domcontentloaded' })

      const emailInput = page.locator(FLOW_SELECTORS.emailInput)
      await expect(emailInput).toBeVisible()

      // "Send Reset Link" button exists (may be disabled until email is filled)
      await expect(page.getByText(/Send Reset Link/i)).toBeVisible()
    })

    test('submit email shows success message', async ({ page }) => {
      await page.goto('/en/forgot-password', { waitUntil: 'domcontentloaded' })

      // Fill email first (button is disabled until email is present)
      const emailInput = page.locator(FLOW_SELECTORS.emailInput)
      await emailInput.fill(FLOW_DATA.testEmail)

      // Wait for button to become enabled, then click
      const submitButton = page.getByRole('button', { name: /Send Reset Link/i })
      await expect(submitButton).toBeEnabled({ timeout: 3000 })
      await submitButton.click()

      // Should show success state with check email message
      // Supabase returns success even for non-existent emails (security best practice)
      await expect(page.getByText(/check your email|email.*sent/i).first()).toBeVisible({
        timeout: 15000,
      })
    })

    test('has back to login link', async ({ page }) => {
      await page.goto('/en/forgot-password', { waitUntil: 'domcontentloaded' })

      const backLink = page.getByText(/back to login/i).first()
      await expect(backLink).toBeVisible()
    })
  })
})
