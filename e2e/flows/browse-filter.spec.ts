import { test, expect } from '@playwright/test'
import { FLOW_SELECTORS } from '../helpers/constants'

test.describe('Browse & Filter Tasks @flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/browse-tasks', { waitUntil: 'domcontentloaded' })
    // Scroll to the filter section (below hero)
    await page.locator(FLOW_SELECTORS.taskFilters).scrollIntoViewIfNeeded()
  })

  test('filter section and results render', async ({ page }) => {
    const filters = page.locator(FLOW_SELECTORS.taskFilters)
    await expect(filters).toBeVisible()

    const results = page.locator(FLOW_SELECTORS.browseResults)
    await expect(results).toBeVisible()
  })

  test('search input accepts text and shows suggestions', async ({ page }) => {
    const searchInput = page.locator(FLOW_SELECTORS.searchInput)
    await expect(searchInput).toBeVisible()

    await searchInput.fill('plumber')
    // Suggestions dropdown should appear after typing 2+ chars
    await expect(page.locator('text=plumber').first()).toBeVisible({ timeout: 5000 })
  })

  test('clicking a category chip filters results', async ({ page }) => {
    // Popular category chips are Chip components (div with onClick), find by visible text
    const plumberChip = page.locator(FLOW_SELECTORS.taskFilters).getByText('Plumber', { exact: true })
    await expect(plumberChip).toBeVisible({ timeout: 5000 })

    await plumberChip.click()

    // Results area should still be visible (may show filtered results or no-results state)
    const results = page.locator(FLOW_SELECTORS.browseResults)
    await expect(results).toBeVisible()
  })

  test('clicking a city chip filters results', async ({ page }) => {
    // City chips rendered as Chip components with onClick
    const sofiaChip = page.locator(FLOW_SELECTORS.taskFilters).getByText('Sofia', { exact: true })
    await expect(sofiaChip).toBeVisible({ timeout: 5000 })

    await sofiaChip.click()

    const results = page.locator(FLOW_SELECTORS.browseResults)
    await expect(results).toBeVisible()
  })

  test('task cards are displayed in results', async ({ page }) => {
    // Wait for first task card (featured tasks load by default)
    const firstCard = page.locator(FLOW_SELECTORS.firstTaskCard)
    await expect(firstCard).toBeVisible({ timeout: 10000 })

    // Card uses onClick navigation (not <a> tags) — verify it has content
    const seeDetailsButton = firstCard.getByRole('button', { name: /details|see|view/i }).first()
    await expect(seeDetailsButton).toBeVisible()
  })
})
