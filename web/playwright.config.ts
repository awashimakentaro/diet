/* 【責務】
 * web の Playwright E2E 実行設定を定義する。
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
  webServer: {
    command: 'node_modules/.bin/next dev -H 127.0.0.1 -p 3000',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
    env: {
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/postgres',
      NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
      OPENAI_API_KEY: 'test-openai-key',
      NEXT_PUBLIC_MEALS_RETENTION_DAYS: '30',
      STRIPE_SECRET_KEY: 'sk_test_e2e',
      STRIPE_PRO_PRICE_ID: 'price_e2e',
      STRIPE_WEBHOOK_SECRET: 'whsec_e2e',
      SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
    },
  },
});
