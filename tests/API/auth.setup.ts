import { test as setup, expect } from '@playwright/test';
import fs from 'fs';
import { env } from '../../config/env';
import { AUTH_DIR, STORAGE_STATE, TOKEN_FILE } from '../../config/auth';

// Runs before the browser projects (see `dependencies: ['setup']` in playwright.config.ts).
// Gets a token for the current TEST_ENV and saves it as:
//   - playwright/.auth/<env>.json        → storageState: browser tests start logged in
//   - playwright/.auth/<env>.token.json  → API tests send it in the Authorization header
setup('authenticate', async ({ request }) => {
  fs.mkdirSync(AUTH_DIR, { recursive: true });

  if (!env.apiUrl || env.authMode === 'none') {
    // No API for this env, or auth disabled: write an empty state so dependent projects still start.
    fs.writeFileSync(STORAGE_STATE, JSON.stringify({ cookies: [], origins: [] }, null, 2));
    fs.writeFileSync(TOKEN_FILE, JSON.stringify({ token: '' }));
    setup.info().annotations.push({
      type: 'info',
      description: !env.apiUrl ? `No API_URL for '${env.name}' — skipped login` : `API_AUTH=none — skipped login`,
    });
    return;
  }

  // 1. Use a pre-issued token if one is provided (API_TOKEN secret / env/.env.local)
  // 2. Otherwise log in through the API with APP_USERNAME / APP_PASSWORD
  let token = env.apiToken;
  if (!token) {
    const loginResponse = await request.post(`${env.apiUrl}/users/login`, {
      data: { user: { email: env.username, password: env.password } },
    });
    expect(loginResponse.status(), `Login failed for ${env.username} on '${env.name}'`).toEqual(200);
    token = (await loginResponse.json()).user.token;
  }

  // The app keeps its session in localStorage under 'jwtToken'.
  const storageState = {
    cookies: [],
    origins: [{ origin: new URL(env.baseUrl).origin, localStorage: [{ name: 'jwtToken', value: token }] }],
  };
  fs.writeFileSync(STORAGE_STATE, JSON.stringify(storageState, null, 2));
  fs.writeFileSync(TOKEN_FILE, JSON.stringify({ token }));
});
