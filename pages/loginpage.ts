import { BasePage } from './basepage.js';

export class LoginPage extends BasePage {
  private readonly emailInput = this.page.getByLabel('Email address');

  private readonly passwordInput = this.page.getByLabel('Password');

  private readonly loginButton = this.page.getByRole('button', {
    name: 'Login',
  });

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);

    // Force click to avoid the site's ad iframe intercepting the login button.
    await this.loginButton.click({ force: true });
  }
}
