import { test as base } from '@playwright/test';

type AuthFixtures = {
  account1Page: import('@playwright/test').Page;
  account2Page: import('@playwright/test').Page;
};

export const test = base.extend<AuthFixtures>({
  account1Page: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: '.auth/account1.json',
      baseURL: 'https://practice.expandtesting.com',
    });

    const page = await context.newPage();

    await page.goto('/notes/app');

    await page.getByText('MyNotes').waitFor({
      state: 'visible',
      timeout: 30000,
    });

    await use(page);

    await context.close();
  },

  account2Page: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: '.auth/account2.json',
      baseURL: 'https://practice.expandtesting.com',
    });

    const page = await context.newPage();

    await page.goto('/notes/app');

    await page.getByText('MyNotes').waitFor({
      state: 'visible',
      timeout: 30000,
    });

    await use(page);

    await context.close();
  },
});

export { expect } from '@playwright/test';