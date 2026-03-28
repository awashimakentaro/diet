'use client';

import { Suspense, type JSX } from 'react';
import { useRouter } from 'next/navigation';

import { AuthLayout } from '@/app/auth/components/auth-layout';
import { LoginForm } from '@/features/auth/components/login-form';
import { paths } from '@/config/paths';

function LoginPageContent(): JSX.Element {
  const router = useRouter();

  return (
    <AuthLayout>
      <LoginForm onSuccess={() => router.replace(paths.app.root.getHref())} />
    </AuthLayout>
  );
}
//LoginPageContent を Suspense の中に入れて、useSearchParams を安全に使えるようにしている
export default function LoginPage(): JSX.Element {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}
