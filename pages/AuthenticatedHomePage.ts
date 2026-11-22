import { type Page } from '@playwright/test';

export class AuthenticatedHomePage {
  constructor(private readonly page: Page) {}

  get eventManagementEntryPoint() {
    return this.page
      .getByRole('link', { name: /events?/i })
      .or(this.page.getByRole('button', { name: /events?/i }))
      .first();
  }
}
