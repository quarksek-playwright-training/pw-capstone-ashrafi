import 'dotenv/config';
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/loginpage.js';

test('login with valid email and wrong password @regression @auth @negative', async ({
  page,
}) => {
  const loginPage = new LoginPage(page);

  await page.goto('/notes/app/login', {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });

  await loginPage.login(
    process.env.EMAIL1!,
    'WrongPassword@12345',
  );

  await expect(
    page.getByText('Incorrect email address or password'),
  ).toBeVisible({
    timeout: 15000,
  });

  await expect(page).toHaveURL(/\/notes\/app\/login/);
});