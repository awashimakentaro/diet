/* 【責務】
 * Record 画面の未認証リダイレクト導線を E2E で検証する。
 */

import { expect, test } from '@playwright/test';

test('未ログインで record を開くとログイン画面へ戻る', async ({ page }) => {
  await page.goto('/app/record');

  await page.waitForURL(/\/auth\/login\?redirectTo=%2Fapp%2Frecord/);

  await expect(page).toHaveURL(/\/auth\/login\?redirectTo=%2Fapp%2Frecord/);
  await expect(
    page.getByRole('heading', { level: 1, name: 'Diet Web にログイン' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'ログインする' }),
  ).toBeVisible();
});
