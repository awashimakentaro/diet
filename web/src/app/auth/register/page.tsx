'use client';

import { Suspense, type JSX } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { AuthLayout } from '@/app/auth/components/auth-layout';
import { RegisterForm } from '@/features/auth/components/register-form';

function normalizeRedirectTo(candidate: string | null): string {
  if (candidate === null || candidate.startsWith('/app/') === false) {
    return '/app/record';
  }

  return candidate;
}

function RegisterPageContent(): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = normalizeRedirectTo(searchParams.get('redirectTo'));

  return (
    <AuthLayout>
      <RegisterForm onSuccess={() => router.replace(redirectTo)} />
    </AuthLayout>
  );
}
//LoginPageContent を Suspense の中に入れて、useSearchParams を安全に使えるようにしている
export default function RegisterPage(): JSX.Element {
  return (
    <Suspense fallback={null}>
      <RegisterPageContent />
    </Suspense>
  );
}
