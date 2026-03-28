/**
 * web/src/app/page.tsx
 *
 * 【責務】
 * 公開トップとして Home 画面を描画する。
 *
 * 【使用されるエージェント / 処理フロー】
 * - `/` ルートで呼ばれる。
 * - web/src/features/home/home-screen.tsx を公開導線として表示する。
 *
 * 【やらないこと】
 * - 認証制御
 * - データ取得ロジックの直接実装
 * - 画面固有 UI の内製
 *
 * 【他ファイルとの関係】
 * - web/src/features/home/home-screen.tsx を利用する。
 */

import type { JSX } from 'react';

import { HomeScreen } from '@/features/home/home-screen';

export default function HomePage(): JSX.Element {
  return <HomeScreen />;
}
