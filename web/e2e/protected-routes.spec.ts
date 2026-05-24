/* 【責務】
 * 未ログイン状態で保護されたアプリ画面がログインへ戻ることを検証する。
 */

import { expect, test } from '@playwright/test';

const protectedRoutes = [
  { path: '/app', redirectTo: '%2Fapp' },
  { path: '/app/record', redirectTo: '%2Fapp%2Frecord' },
  { path: '/app/workouts', redirectTo: '%2Fapp%2Fworkouts' },
  { path: '/app/foods', redirectTo: '%2Fapp%2Ffoods' },
  { path: '/app/history', redirectTo: '%2Fapp%2Fhistory' },
  { path: '/app/settings', redirectTo: '%2Fapp%2Fsettings' },
] as const;

for (const route of protectedRoutes) {
  test(`未ログインで ${route.path} を開くとログインへ戻る`, async ({ page }) => {
    await page.goto(route.path);

    await page.waitForURL(new RegExp(`/auth/login\\?redirectTo=${route.redirectTo}`));

    await expect(page).toHaveURL(new RegExp(`/auth/login\\?redirectTo=${route.redirectTo}`));
    await expect(
      page.getByRole('heading', { level: 1, name: 'ログイン' }),
    ).toBeVisible();
  });
}
