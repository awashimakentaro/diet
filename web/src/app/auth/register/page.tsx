'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import { AuthLayout } from '@/app/auth/components/auth-layout';
import { RegisterForm } from '@/features/auth/components/register-form';

function normalizeRedirectTo(candidate: string | null): string {
  if (candidate === null || candidate.startsWith('/app/') === false) {
    return '/app/record';
  }

  return candidate;
}

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = normalizeRedirectTo(searchParams.get('redirectTo'));

  return (
    <AuthLayout>
      <RegisterForm onSuccess={() => router.replace(redirectTo)} />
    </AuthLayout>
  );
}
