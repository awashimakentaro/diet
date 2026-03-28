/**
 * web/src/app/page.tsx
 *
 * 【責務】
 * 公開トップとして使い方説明付きの LP を描画する。
 *
 * 【使用されるエージェント / 処理フロー】
 * - `/` ルートで呼ばれる。
 * - web/src/features/landing/landing-screen.tsx を表示する。
 *
 * 【やらないこと】
 * - 認証処理の直接実装
 * - アプリ本体のデータ取得
 * - 食事記録ロジック
 *
 * 【他ファイルとの関係】
 * - web/src/features/landing/landing-screen.tsx を利用する。
 */

import type { JSX } from 'react';

import { LandingScreen } from '@/features/landing/landing-screen';

export default function HomePage(): JSX.Element {
  return <LandingScreen />;
}
