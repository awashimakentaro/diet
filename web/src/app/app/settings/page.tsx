/**
 * web/src/app/app/settings/page.tsx
 *
 * 【責務】
 * Web 版 Settings ページの入口として feature 側の画面を呼び出す。
 *
 * 【使用されるエージェント / 処理フロー】
 * - Next.js `/app/settings` ルートで呼ばれる。
 * - route 専用 UI 組み立てを settings-page-screen.tsx へ委譲する。
 *
 * 【やらないこと】
 * - データ取得
 * - UI 状態管理
 * - 永続化
 *
 * 【他ファイルとの関係】
 * - web/src/app/app/settings/_components/settings-page-screen.tsx を利用する。
 */

import type { JSX } from 'react';

import { SettingsPageScreen } from './_components/settings-page-screen';

/**
 * Settings ページ本体を描画する。
 * 呼び出し元: Next.js `/app/settings` ルート。
 * @returns Settings 画面 JSX
 * @remarks 副作用は存在しない。
 */
export default function SettingsPage(): JSX.Element {
  return <SettingsPageScreen />;
}
