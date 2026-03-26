/**
 * web/src/app/app/foods/page.tsx
 *
 * 【責務】
 * Web 版 Foods ページの入口として feature 側の画面を呼び出す。
 *
 * 【使用されるエージェント / 処理フロー】
 * - Next.js `/app/foods` ルートで呼ばれる。
 * - features/foods/foods-screen.tsx へ表示責務を委譲する。
 *
 * 【やらないこと】
 * - データ取得
 * - UI 状態管理
 * - 永続化
 *
 * 【他ファイルとの関係】
 * - web/src/features/foods/foods-screen.tsx を利用する。
 */

import type { JSX } from 'react';

import { FoodsScreen } from '@/features/foods/foods-screen';

/**
 * Foods ページ本体を描画する。
 * 呼び出し元: Next.js `/app/foods` ルート。
 * @returns Foods 画面 JSX
 * @remarks 副作用は存在しない。
 */
export default function FoodsPage(): JSX.Element {
  return <FoodsScreen />;
}
