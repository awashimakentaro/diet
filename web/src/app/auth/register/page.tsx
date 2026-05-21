'use client';

/**
 * web/src/app/auth/register/page.tsx
 *
 * 【責務】
 * `/auth/register` ルートの入口として、認証レイアウトと新規登録フォームを組み立てる。
 *
 * 【使用されるエージェント / 処理フロー】
 * - Next.js App Router から `/auth/register` ルートで呼ばれる。
 * - 登録成功後はオンボーディングへ遷移させる。
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
import { useRouter } from 'next/navigation';

import { RegisterForm } from '@/features/auth/components/register-form';
import { paths } from '@/config/paths';
import { AuthLayout } from '../_components/auth-layout';

function RegisterPageContent(): JSX.Element {
  const router = useRouter();
  const onboardingHref = `/setup/onboarding?redirectTo=${encodeURIComponent(paths.app.root.getHref())}`;

  return (
    <AuthLayout signedInRedirectTo={onboardingHref}>
      <RegisterForm onSuccess={() => router.replace(onboardingHref)} />
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
