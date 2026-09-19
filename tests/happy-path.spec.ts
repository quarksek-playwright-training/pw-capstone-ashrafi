import { test, expect } from '../fixtures/auth.fixture.js';
import { NotesPage } from '../pages/notespage.js';
import { deleteNote } from '../fixtures/api-cleanup.js';

test.afterEach(async ({ account1Page, request }, testInfo) => {
  const noteIdAttachment = testInfo.attachments.find(
    (attachment) => attachment.name === 'createdNoteId',
  );

  if (!noteIdAttachment?.body) {
    return;
  }

  const noteId = noteIdAttachment.body.toString();

  const token = await account1Page.evaluate(() => {
    return window.localStorage.getItem('token');
  });

  if (!token) {
    throw new Error('Authentication token not found in localStorage.');
  }

  await deleteNote(request, noteId, token);
});

test('create and filter note @smoke @notes', async ({
  account1Page,
}, testInfo) => {
  const notesPage = new NotesPage(account1Page);

  const title = `Playwright Automation ${Date.now()}`;
  const description = `Practice Playwright automation testing ${Date.now()}`;

  let createdNoteId: string | undefined;

  const responsePromise = account1Page.waitForResponse(
    async (response) => {
      if (
        response.request().method() === 'POST' &&
        response.url().includes('/notes/api/notes/')
      ) {
        try {
          const body = await response.json();
          createdNoteId = body.data?.id ?? body.id;
        } catch {
          // Ignore unrelated/unavailable response bodies.
        }
        return true;
      }

      return false;
    },
  );

  await notesPage.openAddNote();

  await notesPage.createNote(
    'Work',
    title,
    description,
  );

  await responsePromise;

  if (!createdNoteId) {
    throw new Error('Created note ID was not found in API response.');
  }

  await testInfo.attach('createdNoteId', {
    body: createdNoteId,
    contentType: 'text/plain',
  });

  await expect(
    account1Page.getByTestId('add-new-note'),
  ).toBeVisible();

  await notesPage.searchNotes(title);

  await expect(
    account1Page
      .getByTestId('note-card-title')
      .filter({ hasText: title }),
  ).toHaveCount(1);

  await expect(
    account1Page
      .getByTestId('note-card-title')
      .filter({ hasText: title }),
  ).toBeVisible();
});
