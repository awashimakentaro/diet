/**
 * web/src/app/page.tsx
 *
 * 【責務】
 * 公開トップ `/` の入口として、route 専用の LP 画面コンポーネントを配置する。
 */

import type { JSX } from 'react';

import { LandingPageScreen } from './_components/landing-page-screen';

export default function HomePage(): JSX.Element {
  return <LandingPageScreen />;
}
