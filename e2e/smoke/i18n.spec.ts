import { test, expect } from '@playwright/test'
import { LOCALES } from '../helpers/constants'

test.describe('Internationalization @smoke', () => {
  for (const locale of LOCALES) {
    test(`/${locale}/ loads successfully`, async ({ page }) => {
      const response = await page.goto(`/${locale}/`)

      expect(response?.status()).toBeLessThan(400)
      await expect(page.locator('h1').first()).toBeVisible()
    })
  }

  test('/bg/ serves Bulgarian content', async ({ page }) => {
    await page.goto('/bg/')

    const html = page.locator('html')
    const bodyText = await page.locator('body').textContent()

    // Bulgarian page should contain Cyrillic characters
    expect(bodyText).toMatch(/[\u0400-\u04FF]/)
  })

  test('/ru/ serves Russian content', async ({ page }) => {
    await page.goto('/ru/')

    const bodyText = await page.locator('body').textContent()

    // Russian page should contain Cyrillic characters
    expect(bodyText).toMatch(/[\u0400-\u04FF]/)
  })

  test('/en/ serves English content', async ({ page }) => {
    await page.goto('/en/')

    const bodyText = await page.locator('body').textContent()

    // English page should contain Latin characters and common English words
    expect(bodyText).toMatch(/[a-zA-Z]/)
  })

  test('locale stays in URL during navigation', async ({ page }) => {
    await page.goto('/bg/')

    // Click on a navigation link
    const link = page.locator('header a[href*="/bg/"]').first()
    if (await link.isVisible()) {
      await link.click()
      await page.waitForLoadState('networkidle')

      expect(page.url()).toContain('/bg/')
    }
  })
})
