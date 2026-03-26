/**
 * web/app/app/page.tsx
 *
 * 【責務】
 * `/app` の Home 画面入口として、ダッシュボード UI を配置する。
 *
 * 【使用箇所】
 * - `http://localhost:3000/app`
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

/**
 * Home 画面を描画する。
 * 呼び出し元: Next.js `/app` ルート。
 * @returns Home 画面 JSX
 * @remarks 副作用は存在しない。
 */
export default function AppHomePage(): JSX.Element {
  return <HomeScreen />;
}
