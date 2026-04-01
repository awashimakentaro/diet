'use client';

/**
 * web/src/app/setup/onboarding/page.tsx
 *
 * 【責務】
 * `/setup/onboarding` ルートの入口として、route 専用の onboarding 画面コンポーネントを配置する。
 *
 * 【使用されるエージェント / 処理フロー】
 * - Next.js App Router から `/setup/onboarding` ルートで呼ばれる。
 * - redirectTo を解釈して onboarding-page-screen.tsx へ渡す。
 *
 * 【やらないこと】
 * - DB 保存
 * - JSX 詳細構築
 * - 認証保護
 *
 * 【他ファイルとの関係】
 * - web/src/app/setup/onboarding/_components/onboarding-page-screen.tsx を利用する。
 * - web/src/config/paths.ts を利用する。
 */

import type { JSX } from 'react';
import { useSearchParams } from 'next/navigation';

import { paths } from '@/config/paths';
import { OnboardingPageScreen } from './_components/onboarding-page-screen';

function normalizeRedirectTo(candidate: string | null): string {
  if (candidate === null || candidate.startsWith('/app/') === false) {
    return paths.app.record.getHref();
  }

  if (candidate === paths.app.onboarding.getHref()) {
    return paths.app.record.getHref();
  }

  return candidate;
}

export default function OnboardingPage(): JSX.Element {
  const searchParams = useSearchParams();
  const redirectTo = normalizeRedirectTo(searchParams.get('redirectTo'));

  return <OnboardingPageScreen redirectTo={redirectTo} />;
}
