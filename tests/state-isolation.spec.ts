import { test, expect } from '../fixtures/auth.fixture.js';
import { NotesPage } from '../pages/notespage.js';
import { deleteNote } from '../fixtures/api-cleanup.js';

test.setTimeout(60000);

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

test('note is isolated between accounts @regression @notes', async ({
  account1Page,
  account2Page,
}, testInfo) => {
  const account1Notes = new NotesPage(account1Page);
  const account2Notes = new NotesPage(account2Page);

  const title = `Isolation Test ${Date.now()}`;
  const description = `Account 1 private note ${Date.now()}`;

  let createdNoteId: string | undefined;

  const responsePromise = account1Page.waitForResponse(
    async (response) => {
      if (
        response.request().method() === 'POST' &&
        response.url().includes('/notes/api/notes/')
      ) {
        try {
          const responseBody = await response.json();

          createdNoteId =
            responseBody.data?.id ?? responseBody.id;
        } catch {
          // Ignore unrelated/unavailable response bodies.
        }

        return true;
      }

      return false;
    },
  );

  await account1Notes.openAddNote();

  await account1Notes.createNote(
    'Work',
    title,
    description,
  );

  await responsePromise;

  if (!createdNoteId) {
    throw new Error('Created note ID was not found in API response.');
  }

  await testInfo.attach('createdNoteId', {
    body: String(createdNoteId),
    contentType: 'text/plain',
  });

  await account1Notes.searchNotes(title);

  await expect(
    account1Page
      .getByTestId('note-card-title')
      .filter({ hasText: title }),
  ).toBeVisible();

  await account2Notes.searchNotes(title);

  await expect(
    account2Page
      .getByTestId('note-card-title')
      .filter({ hasText: title }),
  ).toHaveCount(0);
});