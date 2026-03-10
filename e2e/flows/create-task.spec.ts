import { test, expect } from '@playwright/test'
import { FLOW_SELECTORS, E2E_USERS } from '../helpers/constants'
import { cleanupE2EUsers } from '../helpers/cleanup'

const { email, password, name } = E2E_USERS.client

test.describe('Customer Registration + Task Creation @flow', () => {
  test.setTimeout(120_000)

  test.beforeAll(async () => {
    await cleanupE2EUsers([email])
  })

  test.afterAll(async () => {
    await cleanupE2EUsers([email])
  })

  test('register as customer, create task, verify, cancel, logout', async ({ page }) => {
    // ═══ PART 1: Register as customer ═══

    await page.goto('/en/register?intent=customer', {
      waitUntil: 'domcontentloaded',
    })

    await expect(page.locator('body')).not.toContainText('Internal Server Error')

    // Customer intent goes directly to auth form (step 2)
    const regEmailInput = page.locator(FLOW_SELECTORS.emailInput)
    await expect(regEmailInput).toBeVisible({ timeout: 10000 })
    await regEmailInput.fill(email)

    const regPasswordInput = page.locator(FLOW_SELECTORS.passwordInput)
    await regPasswordInput.fill(password)

    // Fill name field
    const nameInput = page.locator('input[type="text"]').last()
    await nameInput.fill(name)

    // Submit registration
    const submitButton = page.getByRole('button', { name: 'Continue', exact: true })
    await expect(submitButton).toBeEnabled()
    await submitButton.click()

    // Wait for redirect after registration (homepage or profile)
    await page.waitForURL(/\/(en|bg|ru|ua)\//, { timeout: 30000 })
    await expect(page.locator('body')).not.toContainText('Internal Server Error')

    // ═══ PART 2: Create a task ═══

    await page.goto('/en/create-task')
    await expect(page).toHaveURL(/.*create-task/)
    await expect(page.locator('body')).not.toContainText('Internal Server Error')

    // Step 1: Task title + category
    const firstInput = page.locator('input, textarea, select, [role="combobox"]').first()
    await expect(firstInput).toBeVisible({ timeout: 10000 })

    const timestamp = Date.now()
    const taskName = `[[E2E Test]] ${timestamp} Elderly assistance`
    await firstInput.fill(taskName)

    const suggestionOption = page.getByRole('button', { name: 'Elderly Assistance', exact: true })
    await expect(suggestionOption).toBeVisible({ timeout: 10000 })
    await suggestionOption.click()

    // Step 2: Location (City)
    const locationHeading = page.getByRole('heading', { name: /where will the task be performed/i })
    await expect(locationHeading).toBeVisible({ timeout: 10000 })

    const cityInput = page.getByPlaceholder(/select your city/i)
    await expect(cityInput).toBeVisible()
    await cityInput.click()

    // Pick a city from available options
    const allCityPills = page.locator('[class*="popular"] div, [class*="suggest"] div, [class*="city"] div').filter({ hasText: /^[A-Z]/ })
    const cityCount = await allCityPills.count()
    const cityOptions = cityCount > 0
      ? allCityPills
      : page.locator('div').filter({ hasText: /^(Sofia|Plovdiv|Varna|Burgas|Sunny Beach|Bansko)$/ })
    const resolvedCount = await cityOptions.count()
    const randomIndex = Math.floor(Math.random() * (resolvedCount > 0 ? resolvedCount : 1))
    const chosenCityLocator = cityOptions.nth(randomIndex)
    const randomCityDisplay = (await chosenCityLocator.textContent())?.trim() ?? 'Sofia'
    await chosenCityLocator.click()

    // Step 3: Task Description
    const descriptionInput = page.locator('textarea').first()
    await expect(descriptionInput).toBeVisible({ timeout: 10000 })
    await descriptionInput.fill('Some test description for the E2E Client Task')

    // Step 4: Review section
    const reviewHeading = page.getByRole('heading', { name: /review your task/i })
    await expect(reviewHeading).toBeVisible({ timeout: 10000 })
    await expect(page.locator('body')).toContainText(taskName, { timeout: 10000 })
    await expect(page.locator('body')).toContainText(randomCityDisplay, { timeout: 10000 })

    // Step 5: Post Task (user is already logged in from registration)
    const postTaskButton = page.getByRole('button', { name: /post task/i })
    await expect(postTaskButton).toBeVisible()
    await expect(postTaskButton).toBeEnabled()
    await postTaskButton.click()

    // ═══ PART 3: Verify task on dashboard ═══

    // Should redirect to tasks/posted (already authenticated)
    await expect(page).toHaveURL(/\/tasks\/posted/, { timeout: 30000 })
    await page.waitForTimeout(7000)

    await expect(page.locator('body')).toContainText(taskName, { timeout: 15000 })
    await expect(page.locator('body')).toContainText(randomCityDisplay)

    // Verify action buttons
    await expect(page.getByRole('button', { name: /details/i }).or(page.getByRole('link', { name: /details/i })).first()).toBeVisible()
    await expect(page.getByRole('button', { name: /edit/i }).first()).toBeVisible()
    await expect(page.getByRole('button', { name: /view applications/i }).or(page.getByRole('button', { name: /view applicants/i })).first()).toBeVisible()
    await expect(page.getByRole('button', { name: /cancel/i }).first()).toBeVisible()

    // Step 7b: Verify task appears in Browse Tasks search
    await page.goto('/en/browse-tasks')
    await expect(page).toHaveURL(/.*browse-tasks/)

    const browseSearchInput = page.locator('input[type="search"], input[placeholder*="search" i], input[placeholder*="task" i], input[data-slot="input"]').first()
    await expect(browseSearchInput).toBeVisible({ timeout: 10000 })
    await browseSearchInput.fill(taskName)
    await browseSearchInput.press('Enter')

    await expect(page.locator('body')).toContainText(taskName, { timeout: 15000 })

    // ═══ PART 4: Cancel the task ═══

    await page.goto('/en/tasks/posted')
    await page.waitForTimeout(3000)

    await page.getByRole('button', { name: /cancel/i }).first().click()

    const cancelDialog = page.getByRole('dialog').or(page.locator('[role="alertdialog"]'))
    await expect(cancelDialog).toBeVisible({ timeout: 10000 })

    const confirmCancelButton = cancelDialog.getByRole('button', { name: /yes.*cancel.*task/i })
    await expect(confirmCancelButton).toBeVisible()
    await confirmCancelButton.click()

    await page.waitForTimeout(2000)
    await expect(page.locator('body')).not.toContainText(taskName, { timeout: 10000 })

    // Verify task appears in Cancelled tab
    const cancelledTab = page.locator('button').filter({ hasText: /^Cancelled/ }).first()
    await expect(cancelledTab).toBeVisible({ timeout: 10000 })
    await cancelledTab.click()
    await expect(page.locator('body')).toContainText(taskName, { timeout: 15000 })

    // ═══ PART 5: Logout ═══

    const userAvatarButton = page.locator('#nav-user-menu')
    await userAvatarButton.click()

    const logoutOption = page.getByRole('menuitem', { name: /log out|sign out|logout/i })
      .or(page.getByRole('button', { name: /log out|sign out|logout/i }))
      .or(page.getByRole('link', { name: /log out|sign out|logout/i }))
    await expect(logoutOption.first()).toBeVisible({ timeout: 5000 })
    await logoutOption.first().click()

    await expect(page).toHaveURL('https://trudify.com/en', { timeout: 10000 })
  })
})
