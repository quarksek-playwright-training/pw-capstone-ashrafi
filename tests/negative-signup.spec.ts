import { test, expect } from '@playwright/test';
import { RegisterPage } from '../pages/registerpage.js';

test('signup with existing email @regression @auth @negative', async ({
  page,
}) => {
  const registerPage = new RegisterPage(page);

  await page.goto('/notes/app/register');

  await registerPage.register(
    process.env.EMAIL1!,
    process.env.PASSWORD!,
    'Duplicate User',
    process.env.PASSWORD!,
  );

  await expect(page.getByText('Loading...')).toBeHidden();

  await expect(
    page.getByText('An account already exists with the same email address'),
  ).toBeVisible();

  await expect(page).toHaveURL(/\/notes\/app\/register/);
});