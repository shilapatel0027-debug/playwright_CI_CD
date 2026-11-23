import { test as base, type APIRequestContext } from '@playwright/test';
import { env } from '../config/env';
import { readToken } from '../config/auth';

type AuthFixtures = {
  /** Token for the current TEST_ENV (from auth.setup.ts). */
  authToken: string;
  /** Request context for API_URL with the Authorization header already set. */
  api: APIRequestContext;
};

export const test = base.extend<AuthFixtures>({
  authToken: async ({}, use) => {
    await use(readToken());
  },
  api: async ({ playwright, authToken }, use) => {
    const api = await playwright.request.newContext({
      // Trailing slash so relative paths like 'articles/x' resolve under /api/
      baseURL: `${env.apiUrl}/`,
      // No header when there is no token (API_AUTH=none)
      extraHTTPHeaders: authToken ? { Authorization: `Token ${authToken}` } : {},
    });
    await use(api);
    await api.dispose();
  },
});

export { expect } from '@playwright/test';
