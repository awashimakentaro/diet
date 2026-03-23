/**
 * web/app/layout.tsx
 *
 * 【責務】
 * Next.js App Router のルートレイアウトと共通メタデータを定義する。
 *
 * 【使用箇所】
 * - Web 版のすべてのルートで自動的に適用される。
 *
 * 【やらないこと】
 * - ページ固有 UI の実装
 * - データ取得
 * - 状態管理
 *
 * 【他ファイルとの関係】
 * - web/app/globals.css を読み込み、各 page.tsx の土台となる。
 */

import type { Metadata } from 'next';
import type { JSX, ReactNode } from 'react';

import './globals.css';

export const metadata: Metadata = {
  title: 'Diet Web',
  description: 'Diet アプリの Web 版ダッシュボード',
};

type RootLayoutProps = {
  children: ReactNode;
};

/**
 * App Router のルート HTML を返す。
 * 呼び出し元: Next.js App Router。
 * @param props 配下ページの描画結果
 * @returns ルートレイアウト JSX
 * @remarks 副作用は存在しない。
 */
export default function RootLayout({ children }: RootLayoutProps): JSX.Element {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
