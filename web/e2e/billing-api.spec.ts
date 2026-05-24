/* 【責務】
 * 課金APIの最低限の防御線を E2E で検証する。
 */

import { expect, test } from '@playwright/test';

test('Checkout API は未ログインなら 401 を返す', async ({ request }) => {
  const response = await request.post('/api/billing/checkout');

  expect(response.status()).toBe(401);
  await expect(response.json()).resolves.toEqual({
    message: 'ログイン状態を確認できません。',
  });
});

test('Customer Portal API は未ログインなら 401 を返す', async ({ request }) => {
  const response = await request.post('/api/billing/portal');

  expect(response.status()).toBe(401);
  await expect(response.json()).resolves.toEqual({
    message: 'ログイン状態を確認できません。',
  });
});

test('Stripe Webhook は署名が不正なら 400 を返す', async ({ request }) => {
  const response = await request.post('/api/billing/webhook', {
    data: {
      type: 'customer.subscription.updated',
      data: { object: {} },
    },
    headers: {
      'stripe-signature': 't=1,v1=invalid',
    },
  });

  expect(response.status()).toBe(400);
  await expect(response.json()).resolves.toEqual({
    message: 'Invalid signature',
  });
});
