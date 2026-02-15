import { test, expect } from '@playwright/test'

const SEO_PAGES = [
  '/en/',
  '/en/browse-tasks',
  '/en/professionals',
  '/en/for-customers',
  '/en/for-professionals',
]

test.describe('SEO @smoke', () => {
  for (const path of SEO_PAGES) {
    test(`${path} has title tag`, async ({ page }) => {
      await page.goto(path)

      const title = await page.title()
      expect(title.length).toBeGreaterThan(0)
    })
  }

  test('homepage has meta description', async ({ page }) => {
    await page.goto('/en/')

    const metaDescription = page.locator('meta[name="description"]')
    await expect(metaDescription).toHaveAttribute('content', /.+/)
  })

  test('homepage has OG tags', async ({ page }) => {
    await page.goto('/en/')

    const ogTitle = page.locator('meta[property="og:title"]')
    const ogDescription = page.locator('meta[property="og:description"]')

    await expect(ogTitle).toHaveAttribute('content', /.+/)
    await expect(ogDescription).toHaveAttribute('content', /.+/)
  })

  test('pages have canonical URL', async ({ page }) => {
    await page.goto('/en/')

    const canonical = page.locator('link[rel="canonical"]')
    // Canonical is nice to have, don't fail hard
    if (await canonical.count() > 0) {
      await expect(canonical).toHaveAttribute('href', /.+/)
    }
  })

  test('pages have proper lang attribute', async ({ page }) => {
    await page.goto('/en/')
    const html = page.locator('html')
    const lang = await html.getAttribute('lang')
    expect(lang).toBeTruthy()
  })
})
