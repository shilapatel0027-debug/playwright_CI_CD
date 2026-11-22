import dotenv from 'dotenv';
import path from 'path';

export const TEST_ENV = process.env.TEST_ENV || 'qa';

// Load order (first value wins — dotenv never overrides an existing var):
//   1. real process env (GitHub Environment secrets in CI)
//   2. env/.env.local    (local secrets, git-ignored)
//   3. env/.env.<env>    (committed, non-secret config)
dotenv.config({ path: path.resolve(__dirname, '../env/.env.local'), quiet: true });
dotenv.config({ path: path.resolve(__dirname, `../env/.env.${TEST_ENV}`), quiet: true });

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing ${name} for env '${TEST_ENV}'. Set it as a GitHub Environment secret (CI) or in env/.env.local (local).`,
    );
  }
  return value;
}

export const env = {
  name: TEST_ENV,
  baseUrl: required('BASE_URL'),
  // Getters so a missing secret only fails tests that actually need it.
  get username() {
    return required('APP_USERNAME');
  },
  get password() {
    return required('APP_PASSWORD');
  },
  get apiToken() {
    return required('API_TOKEN');
  },
};
