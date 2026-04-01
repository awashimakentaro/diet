/**
 * web/src/app/app/history/page.tsx
 *
 * 【責務】
 * Web 版 History ページの入口として feature 側の画面を呼び出す。
 *
 * 【使用されるエージェント / 処理フロー】
 * - Next.js `/app/history` ルートで呼ばれる。
 * - route 専用 UI 組み立てを history-page-screen.tsx へ委譲する。
 *
 * 【やらないこと】
 * - データ取得
 * - UI 状態管理
 * - 永続化
 *
 * 【他ファイルとの関係】
 * - web/src/app/app/history/_components/history-page-screen.tsx を利用する。
 */

import type { JSX } from 'react';

import { HistoryPageScreen } from './_components/history-page-screen';

/**
 * History ページ本体を描画する。
 * 呼び出し元: Next.js `/app/history` ルート。
 * @returns History 画面 JSX
 * @remarks 副作用は存在しない。
 */
export default function HistoryPage(): JSX.Element {
  return <HistoryPageScreen />;
}
