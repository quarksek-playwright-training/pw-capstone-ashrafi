import { test, expect } from '../fixtures/auth.fixture.js';
import { NotesPage } from '../pages/notespage.js';
import { deleteNote } from '../fixtures/api-cleanup.js';

test.setTimeout(120000);

const notesData = [
  {
    category: 'Work',
    title: `Work Note ${Date.now()}`,
    description: 'Work related automation testing note',
  },
  {
    category: 'Personal',
    title: `Personal Note ${Date.now()}`,
    description: 'Personal testing practice note',
  },
  {
    category: 'Home',
    title: `Home Note ${Date.now()}`,
    description: 'Home related practice note',
  },
];

test.afterEach(async ({ account1Page, request }, testInfo) => {
  const noteIdAttachments = testInfo.attachments.filter(
    (attachment) => attachment.name === 'createdNoteId',
  );

  const storageState = await account1Page.context().storageState();

  const token = storageState.origins
    .flatMap((origin) => origin.localStorage)
    .find((item) => item.name === 'token')?.value;

  if (!token) {
    throw new Error('Authentication token not found in storage state.');
  }

  for (const attachment of noteIdAttachments) {
    if (attachment.body) {
      await deleteNote(
        request,
        attachment.body.toString(),
        token,
      );
    }
  }
});

test(
  'create and filter notes using data-driven approach @regression @notes',
  async ({ account1Page }, testInfo) => {
    const notesPage = new NotesPage(account1Page);

    for (const note of notesData) {
      await account1Page.waitForLoadState('domcontentloaded');

      await expect(
        account1Page.getByTestId('add-new-note'),
      ).toBeVisible({
        timeout: 30000,
      });

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
              // Ignore unavailable response bodies.
            }

            return true;
          }

          return false;
        },
        { timeout: 30000 },
      );

      await notesPage.openAddNote();

      await notesPage.createNote(
        note.category,
        note.title,
        note.description,
      );

      await responsePromise;

      if (!createdNoteId) {
        throw new Error(
          `Created note ID was not found for: ${note.title}`,
        );
      }

      await testInfo.attach('createdNoteId', {
        body: String(createdNoteId),
        contentType: 'text/plain',
      });

      await expect(
        account1Page.getByTestId('add-new-note'),
      ).toBeVisible({
        timeout: 30000,
      });
    }

    for (const note of notesData) {
      await account1Page.waitForLoadState('domcontentloaded');

      await notesPage.searchNotes(note.title);

      await expect(
        account1Page
          .getByTestId('note-card-title')
          .filter({ hasText: note.title }),
      ).toBeVisible({
        timeout: 30000,
      });
    }
  },
);
