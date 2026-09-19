import { test, expect } from '../fixtures/auth.fixture.js';

test('shows failure state when notes API fails @regression @notes @negative', async ({
  account1Page,
}) => {
  await account1Page.route('**/notes/api/notes', async (route) => {
    await route.abort('failed');
  });

  await account1Page.reload();

  await expect(
    account1Page.getByText('Loading...'),
  ).toBeVisible();
});