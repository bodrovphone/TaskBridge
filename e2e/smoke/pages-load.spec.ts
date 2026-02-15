import { test, expect } from '@playwright/test'
import { PUBLIC_PAGES } from '../helpers/constants'

test.describe('Pages Load @smoke', () => {
  for (const page of PUBLIC_PAGES) {
    test(`${page.label} (${page.path}) loads successfully`, async ({ page: p }) => {
      const response = await p.goto(page.path, { waitUntil: 'domcontentloaded' })

      expect(response?.status()).toBeLessThan(400)
      await expect(p.locator('body')).toBeVisible()
    })
  }

  test('root / redirects to a locale', async ({ page }) => {
    const response = await page.goto('/')

    expect(response?.url()).toMatch(/\/(en|bg|ru)(\/|$)/)
  })

  test('homepage has meaningful content', async ({ page }) => {
    await page.goto('/en/')

    // Should have a heading
    const heading = page.locator('h1').first()
    await expect(heading).toBeVisible()

    // Should not show an error page
    await expect(page.locator('body')).not.toContainText('500')
    await expect(page.locator('body')).not.toContainText('Internal Server Error')
  })
})
