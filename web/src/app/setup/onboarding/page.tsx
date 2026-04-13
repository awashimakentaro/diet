/* 【責務】
 * `/setup/onboarding` ルートの入口として、route 専用の onboarding 画面コンポーネントを配置する。
 */

import type { JSX } from 'react';

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

type OnboardingPageProps = {
  searchParams?: Promise<{
    redirectTo?: string | string[];
  }>;
};

export default async function OnboardingPage({
  searchParams,
}: OnboardingPageProps): Promise<JSX.Element> {
  const resolvedSearchParams = await searchParams;
  const redirectToParam = Array.isArray(resolvedSearchParams?.redirectTo)
    ? resolvedSearchParams.redirectTo[0] ?? null
    : resolvedSearchParams?.redirectTo ?? null;
  const redirectTo = normalizeRedirectTo(redirectToParam);

  return <OnboardingPageScreen redirectTo={redirectTo} />;
}
