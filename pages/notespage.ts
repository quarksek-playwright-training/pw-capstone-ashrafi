import { BasePage } from './basepage.js';

export class NotesPage extends BasePage {
  private readonly addNoteButton = this.page.getByRole('button', {
    name: '+ Add Note',
  });

  private readonly categoryDropdown = this.page.getByRole('combobox');

  private readonly titleInput = this.page.getByLabel('Title');

  private readonly descriptionInput = this.page.getByLabel('Description');

  private readonly completedCheckbox = this.page.getByLabel('Completed');

  private readonly createButton = this.page.getByRole('button', {
    name: 'Create',
  });

  private readonly cancelButton = this.page.getByRole('button', {
    name: 'Cancel',
  });

  private readonly searchInput = this.page.getByPlaceholder('Search notes...');

  private readonly searchButton = this.page.getByRole('button', {
    name: 'Search',
  });

  // XPath is used here to demonstrate a stable attribute-based locator
  // where a getBy* locator is not required for this specific framework check.
  private readonly noteCardTitlesXPath = this.page.locator(
    '//*[@data-testid="note-card-title"]',
  );

  // XPath sibling axis is used to locate the description relative to
  // the note title within the note card structure.
  private readonly noteDescriptionSiblingXPath = this.page.locator(
    '//*[@data-testid="note-card-title"]/following-sibling::*',
  );

  async openAddNote(): Promise<void> {
    await this.addNoteButton.click();
  }

  async createNote(
    category: string,
    title: string,
    description: string,
    completed = false,
  ): Promise<void> {
    await this.categoryDropdown.selectOption({ label: category });
    await this.titleInput.fill(title);
    await this.descriptionInput.fill(description);

    if (completed) {
      await this.completedCheckbox.check();
    }

    await this.createButton.click({ force: true });
  }

  async cancelAddNote(): Promise<void> {
    await this.cancelButton.click();
  }

  async searchNotes(searchText: string): Promise<void> {
    await this.searchInput.fill(searchText);
    await this.searchButton.click();
  }

  async selectCategory(category: string): Promise<void> {
    await this.page.getByRole('button', { name: category }).click();
  }
}