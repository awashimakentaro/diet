'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import { AuthLayout } from '@/app/auth/components/auth-layout';
import { LoginForm } from '@/features/auth/components/login-form';
import { paths } from '@/config/paths';


export default function LoginPage(){
  const router = useRouter();
  const searchParams = useSearchParams();
  

  return (
    <AuthLayout>
      <LoginForm onSuccess={() => router.replace(paths.app.record.getHref())} />
    </AuthLayout>
  );
}
