import type { APIRequestContext } from '@playwright/test';

export async function deleteNote(
  request: APIRequestContext,
  noteId: string,
  token: string,
): Promise<void> {
  const response = await request.delete(
    `/notes/api/notes/${noteId}`,
    {
      headers: {
        'X-AUTH-TOKEN': token,
      },
    },
  );

  if (!response.ok() && response.status() !== 404) {
    throw new Error(
      `Failed to delete note ${noteId}. Status: ${response.status()}`,
    );
  }
}
