/**
 * web/src/app/app/page.tsx
 *
 * 【責務】
 * `/app` の Home 画面入口として、ダッシュボード UI を配置する。
 *
 * 【使用されるエージェント / 処理フロー】
 * - `/app` ルートで呼ばれる。
 * - web/src/features/home/home-screen.tsx を描画する。
 *
 * 【やらないこと】
 * - 詳細な UI 構築
 * - API 通信
 * - 認証制御
 *
 * 【他ファイルとの関係】
 * - web/src/features/home/home-screen.tsx を呼び出す。
 */

import type { JSX } from 'react';

import { HomeScreen } from '@/features/home/home-screen';

export default function AppHomePage(): JSX.Element {
  return <HomeScreen />;
}
