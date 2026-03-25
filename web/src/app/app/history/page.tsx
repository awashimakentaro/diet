/**
 * web/src/app/app/history/page.tsx
 *
 * 【責務】
 * Web 版 History ページの入口として feature 側の画面を呼び出す。
 *
 * 【使用されるエージェント / 処理フロー】
 * - Next.js `/app/history` ルートで呼ばれる。
 * - features/history/history-screen.tsx へ表示責務を委譲する。
 *
 * 【やらないこと】
 * - データ取得
 * - UI 状態管理
 * - 永続化
 *
 * 【他ファイルとの関係】
 * - web/src/features/history/history-screen.tsx を利用する。
 */

import type { JSX } from 'react';

import { HistoryScreen } from '@/features/history/history-screen';

/**
 * History ページ本体を描画する。
 * 呼び出し元: Next.js `/app/history` ルート。
 * @returns History 画面 JSX
 * @remarks 副作用は存在しない。
 */
export default function HistoryPage(): JSX.Element {
  return <HistoryScreen />;
}
