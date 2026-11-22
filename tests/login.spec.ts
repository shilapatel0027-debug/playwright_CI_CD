import { expect, test } from '@playwright/test';
import { env } from '../config/env';
import { AuthenticatedHomePage } from '../pages/AuthenticatedHomePage';
import { LoginPage } from '../pages/LoginPage';

test.describe('Login', () => {
  test('Signs in with valid credentials @sanity @e2e', async ({ page }) => {
    const loginPage = new LoginPage(page);
   // const authenticatedHomePage = new AuthenticatedHomePage(page);

    // 1. Enter valid credentials (from APP_USERNAME / APP_PASSWORD) and click Sign In.
    await loginPage.open();
    await loginPage.signIn(env.username, env.password);
    await expect(page).not.toHaveURL(/\/login(?:[/?#]|$)/);

   /*  // 2. Inspect the authenticated page and refresh it.
    await expect(authenticatedHomePage.eventManagementEntryPoint).toBeVisible();
    await page.reload();
    await expect(page).not.toHaveURL(/\/login(?:[/?#]|$)/);
    await expect(authenticatedHomePage.eventManagementEntryPoint).toBeVisible(); */
  });
});
