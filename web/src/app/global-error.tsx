/* 【責務】
 * App Router の描画例外を Sentry へ送信してエラー画面を表示する。
 */

'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({
  error,
  reset,
}: GlobalErrorProps) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="ja">
      <body>
        <main className="auth-page">
          <section className="auth-card auth-card--compact">
            <p className="eyebrow">Unexpected Error</p>
            <h1>画面の表示に失敗しました</h1>
            <p>時間をおいて再度お試しください。</p>
            <button className="primary-button" onClick={() => reset()} type="button">
              再読み込みする
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
