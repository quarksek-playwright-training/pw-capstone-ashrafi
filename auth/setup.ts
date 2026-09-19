import 'dotenv/config';
import { chromium, type Page } from '@playwright/test';
import { mkdir, access } from 'node:fs/promises';
import { LoginPage } from '../pages/loginpage.js';
import { RegisterPage } from '../pages/registerpage.js';

type Account = {
  email: string;
  password: string;
  name: string;
  storagePath: string;
};

const accounts: Account[] = [
  {
    email: process.env.EMAIL1!,
    password: process.env.PASSWORD!,
    name: process.env.NAME!,
    storagePath: '.auth/account1.json',
  },
  {
    email: process.env.EMAIL2!,
    password: process.env.PASSWORD2!,
    name: process.env.NAME2!,
    storagePath: '.auth/account2.json',
  },
];

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function authenticateAccount(
  page: Page,
  account: Account,
): Promise<void> {
  const loginPage = new LoginPage(page);
  const registerPage = new RegisterPage(page);

  await page.goto('/notes/app/login');

  await loginPage.login(account.email, account.password);

  if (!page.url().includes('/login')) {
    await page.getByText('MyNotes').waitFor({
      state: 'visible',
      timeout: 30000,
    });

    return;
  }

  await page.goto('/notes/app/register');

  await registerPage.register(
    account.email,
    account.password,
    account.name,
    account.password,
  );

  await page.goto('/notes/app/login');

  await loginPage.login(account.email, account.password);

  await page.getByText('MyNotes').waitFor({
    state: 'visible',
    timeout: 30000,
  });
}

export default async function globalSetup(): Promise<void> {
  await mkdir('.auth', { recursive: true });

  const browser = await chromium.launch();

  for (const account of accounts) {
    if (await fileExists(account.storagePath)) {
      console.log(`Using existing auth: ${account.storagePath}`);
      continue;
    }

    const context = await browser.newContext({
      baseURL: 'https://practice.expandtesting.com',
    });

    const page = await context.newPage();

    await authenticateAccount(page, account);

    await context.storageState({
      path: account.storagePath,
    });

    await context.close();
  }

  await browser.close();
}