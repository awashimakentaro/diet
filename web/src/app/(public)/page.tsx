/**
 * web/src/app/(public)/page.tsx
 *
 * 【責務】
 * 公開トップ `/` の入口として、route 専用の LP 画面コンポーネントを配置する。
 *
 * 【使用されるエージェント / 処理フロー】
 * - Next.js App Router から `/` ルートで呼ばれる。
 * - route 専用 UI 組み立てを landing-page-screen.tsx へ委譲する。
 *
 * 【やらないこと】
 * - 認証 API の直接呼び出し
 * - アプリ本体データの取得
 * - 食事記録編集
 *
 * 【他ファイルとの関係】
 * - web/src/app/(public)/_components/landing-page-screen.tsx を呼び出す。
 */

import type { JSX } from 'react';

import { LandingPageScreen } from './_components/landing-page-screen';

export default function HomePage(): JSX.Element {
  return <LandingPageScreen />;
}
