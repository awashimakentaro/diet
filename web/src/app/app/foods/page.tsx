/**
 * web/src/app/app/foods/page.tsx
 *
 * 【責務】
 * Web 版 Foods ページの入口として feature 側の画面を呼び出す。
 *
 * 【使用されるエージェント / 処理フロー】
 * - Next.js `/app/foods` ルートで呼ばれる。
 * - route 専用 UI 組み立てを foods-page-screen.tsx へ委譲する。
 *
 * 【やらないこと】
 * - データ取得
 * - UI 状態管理
 * - 永続化
 *
 * 【他ファイルとの関係】
 * - web/src/app/app/foods/_components/foods-page-screen.tsx を利用する。
 */

import type { JSX } from 'react';

import { FoodsPageScreen } from './_components/foods-page-screen';

/**
 * Foods ページ本体を描画する。
 * 呼び出し元: Next.js `/app/foods` ルート。
 * @returns Foods 画面 JSX
 * @remarks 副作用は存在しない。
 */
export default function FoodsPage(): JSX.Element {
  return <FoodsPageScreen />;
}
