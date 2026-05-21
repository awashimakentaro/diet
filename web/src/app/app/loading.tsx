/**
 * web/src/app/app/loading.tsx
 *
 * 【責務】
 * `/app/*` 共通の遷移中ローディングを制御する。
 *
 * 【使用されるエージェント / 処理フロー】
 * - `/app/*` 配下の親 loading fallback として自動表示される。
 * - 共通バーと背景シェルだけ描画する。
 *
 * 【やらないこと】
 * - データ取得
 * - 認証制御
 * - 各画面固有 UI の代替表示
 *
 * 【他ファイルとの関係】
 * - web/src/components/app-top-bar.tsx を利用する。
 */

import type { JSX } from 'react';

import { AppTopBar } from '@/components/app-top-bar';

export default function Loading(): JSX.Element {
  return (
    <div className="app-route-loading-screen">
      <AppTopBar />
      <main className="app-route-loading-shell" aria-hidden="true" />
    </div>
  );
}
