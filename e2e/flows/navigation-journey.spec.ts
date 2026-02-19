import { test, expect } from '@playwright/test'
import { SELECTORS, FLOW_SELECTORS } from '../helpers/constants'

test.describe('Full Navigation Journey @flow', () => {
  test('homepage → browse tasks → task detail → back → professionals', async ({ page }) => {
    // Step 1: Start at homepage
    await page.goto('/en/', { waitUntil: 'domcontentloaded' })
    await expect(page.locator(SELECTORS.header)).toBeVisible()
    await expect(page.locator('h1').first()).toBeVisible()

    // Step 2: Navigate to browse tasks
    await page.goto('/en/browse-tasks', { waitUntil: 'domcontentloaded' })
    await expect(page.locator(FLOW_SELECTORS.taskFilters)).toBeVisible()

    // Step 3: Wait for tasks to load and click into one via "See details" button
    const firstCard = page.locator(FLOW_SELECTORS.firstTaskCard)
    await expect(firstCard).toBeVisible({ timeout: 10000 })

    const seeDetails = firstCard.getByRole('button', { name: /details|see|view/i }).first()
    await seeDetails.click()

    // Step 4: Verify task detail loaded (client-side navigation via router.push)
    await expect(page).toHaveURL(/\/tasks\//, { timeout: 10000 })
    const title = page.locator(FLOW_SELECTORS.taskTitle).first()
    await expect(title).toBeVisible()

    // Step 5: Go back to browse tasks
    const backLink = page.locator(FLOW_SELECTORS.backToBrowse).first()
    await expect(backLink).toBeVisible()
    await backLink.click()
    await expect(page).toHaveURL(/\/browse-tasks/, { timeout: 10000 })

    // Step 6: Navigate to professionals page
    await page.goto('/en/professionals', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('h1').first()).toBeVisible()

    // Professionals page should not show errors
    await expect(page.locator('body')).not.toContainText('Internal Server Error')
    await expect(page.locator('body')).not.toContainText('500')
  })

  test('direct URL navigation works for all key pages', async ({ page }) => {
    const keyPages = [
      { path: '/en/', name: 'Homepage' },
      { path: '/en/browse-tasks', name: 'Browse Tasks' },
      { path: '/en/professionals', name: 'Professionals' },
      { path: '/en/register', name: 'Register' },
      { path: '/en/forgot-password', name: 'Forgot Password' },
    ]

    for (const { path, name } of keyPages) {
      const response = await page.goto(path, { waitUntil: 'domcontentloaded' })
      expect(response?.status(), `${name} should return 200`).toBeLessThan(400)
      await expect(page.locator(SELECTORS.header)).toBeVisible()
    }
  })
})
