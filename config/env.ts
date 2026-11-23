import dotenv from 'dotenv';
import path from 'path';

export const TEST_ENV = process.env.TEST_ENV || 'qa';

// Load order (first value wins — dotenv never overrides an existing var):
//   1. real process env        (GitHub Environment secrets in CI, or inline: APP_USERNAME=... npx playwright test)
//   2. env/.env.<env>.local    (local secrets for ONE env, git-ignored)  e.g. env/.env.qa.local
//   3. env/.env.local          (local secrets shared by all envs, git-ignored)
//   4. env/.env.<env>          (committed, non-secret config: BASE_URL, API_URL)
const envDir = path.resolve(__dirname, '../env');
dotenv.config({ path: path.join(envDir, `.env.${TEST_ENV}.local`), quiet: true });
dotenv.config({ path: path.join(envDir, '.env.local'), quiet: true });
dotenv.config({ path: path.join(envDir, `.env.${TEST_ENV}`), quiet: true });

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing ${name} for env '${TEST_ENV}'. Set it as a GitHub Environment secret (CI) ` +
        `or in env/.env.${TEST_ENV}.local / env/.env.local (local).`,
    );
  }
  return value;
}

export const env = {
  name: TEST_ENV,
  baseUrl: required('BASE_URL'),
  // Optional: empty when this env has no API — API tests skip themselves.
  apiUrl: (process.env.API_URL || '').replace(/\/+$/, ''),
  // 'none' = no login/token, 'token' / 'credentials' = forced by CI,
  // 'auto' (local default) = API_TOKEN if set, else log in with username/password.
  authMode: (process.env.API_AUTH || 'auto') as 'none' | 'token' | 'credentials' | 'auto',
  // Getters so a missing secret only fails tests that actually need it.
  get username() {
    return required('APP_USERNAME');
  },
  get password() {
    return required('APP_PASSWORD');
  },
  // Optional: if set, auth setup uses it instead of logging in.
  get apiToken() {
    return process.env.API_TOKEN || '';
  },
};
