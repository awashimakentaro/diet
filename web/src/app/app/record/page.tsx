/**
 * web/app/record/page.tsx
 *
 * 【責務】
 * Web 版 Record ページの入口として、feature 側の RecordScreen を配置する。
 *
 * 【使用箇所】
 * - `/app/record` ルートで表示される。
 *
 * 【やらないこと】
 * - 記録画面の細かな UI 構築
 * - フォーム状態管理
 * - API 通信
 *
 * 【他ファイルとの関係】
 * - web/src/features/record/record-screen.tsx を呼び出す。
 */

import type { JSX } from 'react';

import { RecordScreen } from '@/features/record/record-screen';

/**
 * 記録画面を描画する。
 * 呼び出し元: Next.js `/app/record` ルート。
 * @returns 記録画面 JSX
 * @remarks 副作用は存在しない。
 */
export default function RecordPage(): JSX.Element {
  return <RecordScreen />;
}
