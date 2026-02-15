import { test, expect } from '@playwright/test'
import { SELECTORS } from '../helpers/constants'

test.describe('Navigation @smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/')
  })

  test('header renders with logo', async ({ page }) => {
    const header = page.locator(SELECTORS.header)
    await expect(header).toBeVisible()

    const logo = header.locator('a').first()
    await expect(logo).toBeVisible()
  })

  test('footer renders', async ({ page }) => {
    const footer = page.locator(SELECTORS.footer)
    await expect(footer).toBeVisible()
  })

  test('footer contains navigation links', async ({ page }) => {
    const footer = page.locator(SELECTORS.footer)
    const links = footer.locator('a')

    expect(await links.count()).toBeGreaterThan(0)
  })

  test('mobile menu toggle works', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Mobile-only test')

    const menuButton = page.locator(SELECTORS.mobileMenuButton)
    await expect(menuButton).toBeVisible()
    await menuButton.click()

    // After clicking, some nav content should appear
    await expect(page.locator('nav a').first()).toBeVisible()
  })
})
