import fs from 'fs';
import path from 'path';
import { TEST_ENV } from './env';

// One auth state per environment, so a qa token is never reused on staging.
// Folder is git-ignored (/playwright/.auth/).
export const AUTH_DIR = path.resolve(__dirname, '../playwright/.auth');
export const STORAGE_STATE = path.join(AUTH_DIR, `${TEST_ENV}.json`);
export const TOKEN_FILE = path.join(AUTH_DIR, `${TEST_ENV}.token.json`);

/** Token written by tests/API/auth.setup.ts. */
export function readToken(): string {
  if (!fs.existsSync(TOKEN_FILE)) {
    throw new Error(`No token for env '${TEST_ENV}'. The 'setup' project must run first (${TOKEN_FILE}).`);
  }
  return JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf-8')).token;
}
