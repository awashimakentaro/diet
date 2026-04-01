/**
 * web/src/app/app/record/page.tsx
 *
 * 【責務】
 * `/app/record` ルートの入口として、route 専用の Record 画面コンポーネントを配置する。
 *
 * 【使用されるエージェント / 処理フロー】
 * - Next.js App Router から `/app/record` ルートで呼ばれる。
 * - route 専用 UI 組み立てを record-page-screen.tsx へ委譲する。
 *
 * 【やらないこと】
 * - 記録画面の細かな UI 構築
 * - フォーム状態管理
 * - API 通信
 *
 * 【他ファイルとの関係】
 * - web/src/app/app/record/_components/record-page-screen.tsx を呼び出す。
 */

import type { JSX } from 'react';

import { RecordPageScreen } from './_components/record-page-screen';

/**
 * 記録画面を描画する。
 * 呼び出し元: Next.js `/app/record` ルート。
 * @returns 記録画面 JSX
 * @remarks 副作用は存在しない。
 */
export default function RecordPage(): JSX.Element {
  return <RecordPageScreen />;
}
