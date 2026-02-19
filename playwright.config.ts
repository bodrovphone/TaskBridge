import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }]]
    : [['html', { open: 'on-failure' }]],

  use: {
    baseURL: process.env.BASE_URL || 'https://trudify.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    timezoneId: 'Europe/Sofia',
  },

  timeout: 30_000,
  expect: { timeout: 10_000 },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testDir: './e2e/smoke',
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      testDir: './e2e/smoke',
    },
    {
      name: 'flows-chromium',
      use: { ...devices['Desktop Chrome'] },
      testDir: './e2e/flows',
    },
    {
      name: 'flows-firefox',
      use: { ...devices['Desktop Firefox'] },
      testDir: './e2e/flows',
    },
  ],
})
