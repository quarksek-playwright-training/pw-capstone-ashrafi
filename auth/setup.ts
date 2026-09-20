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

const BASE_URL = 'https://practice.expandtesting.com';

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function waitForAuthenticatedArea(page: Page): Promise<boolean> {
  try {
    await page.getByText('MyNotes').waitFor({
      state: 'visible',
      timeout: 30000,
    });

    return true;
  } catch {
    return false;
  }
}

async function authenticateAccount(
  page: Page,
  account: Account,
): Promise<void> {
  page.setDefaultTimeout(60000);

  const loginPage = new LoginPage(page);
  const registerPage = new RegisterPage(page);

  await page.goto('/notes/app/login', {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });

  await loginPage.login(account.email, account.password);

  await page.waitForTimeout(3000);

  // Successful login is determined by the authenticated UI,
  // rather than waiting for a specific navigation event.
  if (await waitForAuthenticatedArea(page)) {
    return;
  }

  // If the account does not exist, create it.
  const loginError = page.getByText(
    'Incorrect email address or password',
  );

  if (await loginError.isVisible().catch(() => false)) {
    await page.goto('/notes/app/register', {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });

    await registerPage.register(
      account.email,
      account.password,
      account.name,
      account.password,
    );

    await page.goto('/notes/app/login', {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });

    await loginPage.login(account.email, account.password);

    await page.waitForTimeout(3000);

    if (await waitForAuthenticatedArea(page)) {
      return;
    }
  }

  console.log(`Authentication failed for: ${account.email}`);
  console.log(`Current URL: ${page.url()}`);

  await page.screenshot({
    path: `.auth/${account.name}-auth-failure.png`,
    fullPage: true,
  });

  throw new Error(
    `Unable to authenticate account: ${account.email}`,
  );
}

export default async function globalSetup(): Promise<void> {
  await mkdir('.auth', { recursive: true });

  const browser = await chromium.launch();

  try {
    for (const account of accounts) {
      if (await fileExists(account.storagePath)) {
        console.log(`Using existing auth: ${account.storagePath}`);
        continue;
      }

      console.log(`Authenticating account: ${account.email}`);

      const context = await browser.newContext({
        baseURL: BASE_URL,
      });

      const page = await context.newPage();

      try {
        await authenticateAccount(page, account);

        await context.storageState({
          path: account.storagePath,
        });

        console.log(
          `Authentication successful: ${account.storagePath}`,
        );
      } finally {
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }
}
