import { test, expect } from '@playwright/test'
import { FLOW_DATA } from '../helpers/constants'

const E2E_EMAIL = process.env.E2E_USER_EMAIL!
const E2E_PASSWORD = process.env.E2E_USER_PASSWORD!

test.describe('Post a task (Anonymous) @smoke', () => {
  test('anonymous user can start task creation flow', async ({ page }) => {
    // Navigate directly to create task page
    await page.goto('/en/create-task')

    // Verify we are on the create task page
    await expect(page).toHaveURL(/.*create-task/)

    // Ensure the page loaded successfully
    await expect(page.locator('body')).not.toContainText('Internal Server Error')

    // Check that we see the first step of the form (e.g. title input or category selection)
    const firstInput = page.locator('input, textarea, select, [role="combobox"]').first()
    await expect(firstInput).toBeVisible({ timeout: 10000 })

    // Set the task name using the requested specific format
    const timestamp = Date.now()
    const taskName = `[[E2E Test]] ${timestamp} Elderly assistance`
    await firstInput.fill(taskName)

    // Wait for the category suggestion options to appear and verify "Elderly Assistance" is present
    const suggestionOption = page.getByRole('button', { name: 'Elderly Assistance', exact: true })
    await expect(suggestionOption).toBeVisible({ timeout: 10000 })

    // Select the "Elderly Assistance" option
    await suggestionOption.click()

    // ─── Step 2: Location (City) ───
    const locationHeading = page.getByRole('heading', { name: /where will the task be performed/i })
    await expect(locationHeading).toBeVisible({ timeout: 10000 })

    // Verify the city input field exists and click it to reveal suggestions
    const cityInput = page.getByPlaceholder(/select your city/i)
    await expect(cityInput).toBeVisible()
    await cityInput.click()

    // Parse ALL city pills rendered on page and pick one at random
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

    // ─── Step 3: Task Description ───
    const descriptionInput = page.locator('textarea').first()
    await expect(descriptionInput).toBeVisible({ timeout: 10000 })
    await descriptionInput.fill('Some test description for the Anonymous User Task')

    // ─── Step 4: Review section ───
    const reviewHeading = page.getByRole('heading', { name: /review your task/i })
    await expect(reviewHeading).toBeVisible({ timeout: 10000 })

    // Verify the task title appears in the review card
    await expect(page.locator('body')).toContainText(taskName, { timeout: 10000 })

    // Verify the location selected appears in the review card
    await expect(page.locator('body')).toContainText(randomCityDisplay, { timeout: 10000 })

    // ─── Step 5: Post Task ───
    const postTaskButton = page.getByRole('button', { name: /post task/i })
    await expect(postTaskButton).toBeVisible()
    await expect(postTaskButton).toBeEnabled()
    await postTaskButton.click()

    // ─── Step 6: Login sidebar ───
    // Verify the login sidebar/modal appeared
    const emailInput = page.locator('input[type="email"]')
    await expect(emailInput).toBeVisible({ timeout: 10000 })

    await emailInput.fill(E2E_EMAIL)

    const passwordInput = page.locator('input[type="password"]')
    await passwordInput.fill(E2E_PASSWORD)

    // Click the Continue button inside the login form
    const continueButton = page.getByRole('button', { name: 'Continue', exact: true })
    await expect(continueButton).toBeVisible()
    await continueButton.click()

    // ─── Step 7: Verify dashboard redirect and task card ───
    // Wait for redirect to personal cabinet / tasks dashboard (/en/tasks/posted)
    await expect(page).toHaveURL(/\/tasks\/posted/, { timeout: 30000 })

    // Give the page a moment to fully load the task list
    await page.waitForTimeout(7000)

    // The task card should show the title we entered
    await expect(page.locator('body')).toContainText(taskName, { timeout: 15000 })

    // Verify the selected city (location) appears on the task card
    await expect(page.locator('body')).toContainText(randomCityDisplay)


    // Verify action buttons are present on the task card
    await expect(page.getByRole('button', { name: /details/i }).or(page.getByRole('link', { name: /details/i })).first()).toBeVisible()
    await expect(page.getByRole('button', { name: /edit/i }).first()).toBeVisible()
    await expect(page.getByRole('button', { name: /view applications/i }).or(page.getByRole('button', { name: /view applicants/i })).first()).toBeVisible()
    await expect(page.getByRole('button', { name: /cancel/i }).first()).toBeVisible()

    // ─── Step 7b: Verify task appears in Browse Tasks search ───
    await page.goto('/en/browse-tasks')
    await expect(page).toHaveURL(/.*browse-tasks/)

    // Find the search input and type the task name
    const browseSearchInput = page.locator('input[type="search"], input[placeholder*="search" i], input[placeholder*="task" i], input[data-slot="input"]').first()
    await expect(browseSearchInput).toBeVisible({ timeout: 10000 })
    await browseSearchInput.fill(taskName)
    await browseSearchInput.press('Enter')

    // Verify the task appears in search results
    await expect(page.locator('body')).toContainText(taskName, { timeout: 15000 })

    // Go back to the tasks dashboard to cancel the task
    await page.goto('/en/tasks/posted')
    await page.waitForTimeout(3000)

    // ─── Step 8: Cancel the task ───
    await page.getByRole('button', { name: /cancel/i }).first().click()

    // Confirm the cancellation dialog appeared
    const cancelDialog = page.getByRole('dialog').or(page.locator('[role="alertdialog"]'))
    await expect(cancelDialog).toBeVisible({ timeout: 10000 })

    // Click the confirmation button "Yes, Cancel Task"
    const confirmCancelButton = cancelDialog.getByRole('button', { name: /yes.*cancel.*task/i })
    await expect(confirmCancelButton).toBeVisible()
    await confirmCancelButton.click()

    // Verify the task is no longer in the Open section
    await page.waitForTimeout(2000)
    await expect(page.locator('body')).not.toContainText(taskName, { timeout: 10000 })

    // ─── Step 9: Verify task appears in Cancelled tab ───
    const cancelledTab = page.locator('button').filter({ hasText: /^Cancelled/ }).first()
    await expect(cancelledTab).toBeVisible({ timeout: 10000 })
    await cancelledTab.click()

    // Verify the cancelled task card appears in this section
    await expect(page.locator('body')).toContainText(taskName, { timeout: 15000 })

    // ─── Step 10: Logout ───
    // Click on the user avatar / profile icon in the header
    const userAvatarButton = page.locator('#nav-user-menu');
    await userAvatarButton.click()

    // Click the Logout / Sign out option in the dropdown
    const logoutOption = page.getByRole('menuitem', { name: /log out|sign out|logout/i })
      .or(page.getByRole('button', { name: /log out|sign out|logout/i }))
      .or(page.getByRole('link', { name: /log out|sign out|logout/i }))
    await expect(logoutOption.first()).toBeVisible({ timeout: 5000 })
    await logoutOption.first().click()

    // Verify we are logged out (redirected back to homepage or auth page)
    await expect(page).toHaveURL('https://trudify.com/en', { timeout: 10000 })
  })
})
