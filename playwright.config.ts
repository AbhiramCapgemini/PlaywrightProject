import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  testDir:     './tests/api',
  globalSetup: './global-setup.ts',
  timeout:     30_000,
  retries:     1,
  workers:     2,
  reporter: [
    ['list'],
    ['html',  { outputFolder: 'playwright-report', open: 'never' }],
    ['json',  { outputFile:   'playwright-report/results.json' }],
    ['junit', { outputFile:   'playwright-report/junit.xml' }],
  ],
  use: {
    baseURL:          process.env['BASE_URL'] ?? 'https://dummyjson.com',
    extraHTTPHeaders: { 'Content-Type': 'application/json' },
  },
});
