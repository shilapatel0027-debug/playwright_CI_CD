import { expect, test } from '@playwright/test';
import { env } from '../../config/env';
import { AuthenticatedHomePage } from '../../pages/AuthenticatedHomePage';
import { LoginPage } from '../../pages/LoginPage';

test.describe('Login', () => {
  // This test checks the login form itself, so start logged out.
  test.use({ storageState: { cookies: [], origins: [] } });

  test('Signs in with valid credentials @sanity @e2e', async ({ page }) => {
    const loginPage = new LoginPage(page);
   // const authenticatedHomePage = new AuthenticatedHomePage(page);

    // 1. Enter valid credentials (from APP_USERNAME / APP_PASSWORD) and click Sign In.
    await loginPage.open();
    await loginPage.signIn(env.username, env.password);
    await expect(page).not.toHaveURL(/\/login(?:[/?#]|$)/);

    await page.waitForTimeout(5000);  
   
  });
});
