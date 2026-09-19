import { BasePage } from './basepage.js';

export class RegisterPage extends BasePage {
  private readonly emailInput = this.page.locator(
    'input[type="email"], input[name="email"]',
  );

  private readonly passwordInputs = this.page.locator(
    'input[type="password"]',
  );

  private readonly nameInput = this.page.locator(
    'input[name="name"], input[placeholder="Name"]',
  );

  private readonly registerButton = this.page.getByRole('button', {
    name: 'Register',
  });

  async register(
    email: string,
    password: string,
    name: string,
    confirmPassword: string,
  ): Promise<void> {
    await this.emailInput.fill(email);

    await this.passwordInputs.nth(0).fill(password);

    await this.nameInput.fill(name);

    await this.passwordInputs.nth(1).fill(confirmPassword);

    await this.registerButton.click();
  }
}
