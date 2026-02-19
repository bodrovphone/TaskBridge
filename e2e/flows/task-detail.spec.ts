import { test, expect } from '@playwright/test'
import { FLOW_SELECTORS } from '../helpers/constants'

test.describe('View Task Detail @flow', () => {
  test('navigate from browse to task detail and verify sections', async ({ page }) => {
    // Start at browse tasks
    await page.goto('/en/browse-tasks', { waitUntil: 'domcontentloaded' })

    // Wait for first task card to render
    const firstCard = page.locator(FLOW_SELECTORS.firstTaskCard)
    await expect(firstCard).toBeVisible({ timeout: 10000 })

    // Click the "See Details" button on the card (cards use onClick/router.push, not <a> tags)
    const seeDetails = firstCard.getByRole('button', { name: /details|see|view/i }).first()
    await seeDetails.click()

    // Should navigate to a task detail page (client-side navigation)
    await expect(page).toHaveURL(/\/tasks\//, { timeout: 10000 })

    // Task title should render
    const title = page.locator(FLOW_SELECTORS.taskTitle).first()
    await expect(title).toBeVisible()
    const titleText = await title.textContent()
    expect(titleText?.length).toBeGreaterThan(0)

    // Page should not be an error
    await expect(page.locator('body')).not.toContainText('Internal Server Error')
  })

  test('task detail has back navigation to browse', async ({ page }) => {
    // Navigate to browse first, then into a task
    await page.goto('/en/browse-tasks', { waitUntil: 'domcontentloaded' })

    const firstCard = page.locator(FLOW_SELECTORS.firstTaskCard)
    await expect(firstCard).toBeVisible({ timeout: 10000 })

    // Click card to navigate
    const seeDetails = firstCard.getByRole('button', { name: /details|see|view/i }).first()
    await seeDetails.click()
    await expect(page).toHaveURL(/\/tasks\//, { timeout: 10000 })

    // Back link should exist
    const backLink = page.locator(FLOW_SELECTORS.backToBrowse).first()
    await expect(backLink).toBeVisible()

    // Click back and verify we return to browse
    await backLink.click()
    await expect(page).toHaveURL(/\/browse-tasks/, { timeout: 10000 })
  })
})
