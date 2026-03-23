/**
 * web/src/app/not-found.tsx
 *
 * 【責務】
 * Web 版で存在しないルートへアクセスした際の 404 画面を描画する。
 *
 * 【使用箇所】
 * - App Router が未定義ルートを解決できない場合に自動利用する。
 *
 * 【やらないこと】
 * - 認証状態の判定
 * - データ取得
 * - 自動リダイレクト
 *
 * 【他ファイルとの関係】
 * - web/src/app/page.tsx のログイン画面
 * - web/src/app/app/record/page.tsx の記録画面
 */

import Link from 'next/link';
import type { JSX } from 'react';

/**
 * 404 画面を描画する。
 * 呼び出し元: Next.js App Router。
 * @returns 未定義ルート向けの案内画面 JSX
 * @remarks 副作用は存在しない。
 */
export default function NotFoundPage(): JSX.Element {
  return (
    <main className="auth-page">
      <section className="auth-card auth-card--compact">
        <div className="auth-copy">
          <p className="eyebrow">404</p>
          <h1>ページが見つかりません</h1>
          <p>この Web 版の正規ルートは `/` と `/app/*` です。必要な画面へ戻ってください。</p>
        </div>
        <div className="button-row">
          <Link className="secondary-button" href="/">
            ログイン画面へ戻る
          </Link>
          <Link className="primary-button" href="/app/record">
            記録画面へ移動
          </Link>
        </div>
      </section>
    </main>
  );
}
