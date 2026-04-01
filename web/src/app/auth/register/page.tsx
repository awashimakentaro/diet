'use client';

/**
 * web/src/app/auth/register/page.tsx
 *
 * 【責務】
 * `/auth/register` ルートの入口として、認証レイアウトと新規登録フォームを組み立てる。
 *
 * 【使用されるエージェント / 処理フロー】
 * - Next.js App Router から `/auth/register` ルートで呼ばれる。
 * - redirectTo を解釈し、登録成功後は onboarding へ遷移させる。
 *
 * 【やらないこと】
 * - 認証 API の直接実装
 * - アプリ本体 UI の描画
 * - 共通レイアウト定義
 *
 * 【他ファイルとの関係】
 * - web/src/app/auth/_components/auth-layout.tsx を利用する。
 * - web/src/features/auth/components/register-form.tsx を利用する。
 */

import { Suspense, type JSX } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { RegisterForm } from '@/features/auth/components/register-form';
import { paths } from '@/config/paths';
import { AuthLayout } from '../_components/auth-layout';

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
      <RegisterForm onSuccess={() => router.replace(paths.app.onboarding.getHref(redirectTo))} />
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
