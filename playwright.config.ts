import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',

  globalSetup: './auth/setup.ts',

  fullyParallel: false,

workers: 1,

  forbidOnly: !!process.env.CI,

  retries: process.env.CI ? 2 : 0,

  ...(process.env.CI ? { workers: 1 } : {}),

  reporter: [['html', { open: 'never' }]],

  use: {
    baseURL: 'https://practice.expandtesting.com',

    trace: 'on-first-retry',

    screenshot: 'only-on-failure',

    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});