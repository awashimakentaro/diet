/* 【責務】
 * Web サーバー側の Sentry SDK 初期化を必要時に補完する。
 */

import * as Sentry from '@sentry/nextjs';

let isServerSentryInitialized = false;

export function ensureServerSentryInitialized(): boolean {
  const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;

  if (!dsn) {
    return false;
  }

  if (Sentry.getClient()) {
    return true;
  }

  if (!isServerSentryInitialized) {
    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 0,
    });
    isServerSentryInitialized = true;
  }

  return Boolean(Sentry.getClient());
}
