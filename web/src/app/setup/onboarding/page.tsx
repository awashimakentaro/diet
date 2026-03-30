'use client';
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
