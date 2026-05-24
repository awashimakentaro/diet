/* 【責務】
 * 公開トップの主要導線を E2E で検証する。
 */

import { expect, test } from '@playwright/test';

test('公開トップで主要導線が表示される', async ({ page }) => {
  await page.goto('/');

  await expect(
    page.getByRole('heading', {
      level: 1,
      name: /NO MORE\s+面倒な食事管理。/,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: '新規登録して始める' }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'ログイン' }),
  ).toBeVisible();
});
