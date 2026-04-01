/**
 * web/src/app/app/page.tsx
 *
 * 【責務】
 * `/app` の Home 画面入口として、ダッシュボード UI を配置する。
 *
 * 【使用されるエージェント / 処理フロー】
 * - `/app` ルートで呼ばれる。
 * - route 専用 UI 組み立てを home-page-screen.tsx へ委譲する。
 *
 * 【やらないこと】
 * - 詳細な UI 構築
 * - API 通信
 * - 認証制御
 *
 * 【他ファイルとの関係】
 * - web/src/app/app/(home)/_components/home-page-screen.tsx を呼び出す。
 */

import type { JSX } from 'react';

import { HomePageScreen } from './_components/home-page-screen';

export default function AppHomePage(): JSX.Element {
  return <HomePageScreen />;
}
