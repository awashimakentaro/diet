/* 【責務】
 * Web サーバー実行時の Sentry SDK 初期化を行う。
 */

import * as Sentry from '@sentry/nextjs';

export async function register(): Promise<void> {
  Sentry.init({
    dsn: process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0,
  });
}

export const onRequestError = Sentry.captureRequestError;
