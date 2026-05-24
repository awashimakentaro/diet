/* 【責務】
 * 公開前に必要な規約・問い合わせページの到達性を E2E で検証する。
 */

import { expect, test } from '@playwright/test';

const legalPages = [
  { path: '/terms', heading: '利用規約' },
  { path: '/privacy', heading: 'プライバシーポリシー' },
  { path: '/commerce', heading: '特定商取引法に基づく表記' },
  { path: '/contact', heading: 'お問い合わせ' },
] as const;

for (const pageInfo of legalPages) {
  test(`${pageInfo.heading} ページが表示される`, async ({ page }) => {
    await page.goto(pageInfo.path);

    await expect(
      page.getByRole('heading', { level: 1, name: pageInfo.heading }),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: 'PFC TRACKER' })).toBeVisible();
  });
}
