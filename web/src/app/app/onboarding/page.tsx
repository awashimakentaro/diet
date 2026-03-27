'use client';

/**
 * web/src/app/app/onboarding/page.tsx
 *
 * 【責務】
 * 登録直後のオンボーディング画面を起動する。
 *
 * 【使用されるエージェント / 処理フロー】
 * - `/app/onboarding` ルートで呼ばれる。
 * - redirectTo を解釈して onboarding-screen.tsx へ渡す。
 *
 * 【やらないこと】
 * - DB 保存
 * - JSX 詳細構築
 * - 認証保護
 *
 * 【他ファイルとの関係】
 * - features/onboarding/onboarding-screen.tsx を利用する。
 * - app/app/layout.tsx の認証保護下で表示される。
 */

import type { JSX } from 'react';
import { useSearchParams } from 'next/navigation';

import { OnboardingScreen } from '@/features/onboarding/onboarding-screen';
import { paths } from '@/config/paths';

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

  return <OnboardingScreen redirectTo={redirectTo} />;
}
