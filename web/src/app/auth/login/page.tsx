'use client';

/**
 * web/src/app/auth/login/page.tsx
 *
 * 【責務】
 * `/auth/login` ルートの入口として、認証レイアウトとログインフォームを組み立てる。
 *
 * 【使用されるエージェント / 処理フロー】
 * - Next.js App Router から `/auth/login` ルートで呼ばれる。
 * - ログイン成功後は `/app` へ遷移させる。
 *
 * 【やらないこと】
 * - 認証 API の直接実装
 * - アプリ本体 UI の描画
 * - 共通レイアウト定義
 *
 * 【他ファイルとの関係】
 * - web/src/app/auth/_components/auth-layout.tsx を利用する。
 * - web/src/features/auth/components/login-form.tsx を利用する。
 */

import { Suspense, type JSX } from 'react';
import { useRouter } from 'next/navigation';

import { LoginForm } from '@/features/auth/components/login-form';
import { paths } from '@/config/paths';
import { AuthLayout } from '../_components/auth-layout';

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
