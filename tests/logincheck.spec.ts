import 'dotenv/config';
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/loginpage.js';

test('login check @smoke @auth', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await page.goto('/notes/app/login', {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });

  await loginPage.login(
    process.env.EMAIL1!,
    process.env.PASSWORD!,
  );

  await expect(page.getByText('MyNotes')).toBeVisible();
});