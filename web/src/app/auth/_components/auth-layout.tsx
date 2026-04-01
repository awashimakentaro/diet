'use client';

/**
 * web/src/app/auth/_components/auth-layout.tsx
 *
 * 【責務】
 * `/auth/*` ルート専用の認証レイアウトを描画し、ログイン済みユーザーを適切な遷移先へ戻す。
 *
 * 【使用されるエージェント / 処理フロー】
 * - web/src/app/auth/login/page.tsx と register/page.tsx から呼ばれる。
 * - redirectTo を解釈し、ログイン済みなら `/app` か元の保護ルートへ戻す。
 *
 * 【やらないこと】
 * - 認証 API の直接呼び出し
 * - フォーム入力 state の管理
 * - アプリ本体の UI 描画
 *
 * 【他ファイルとの関係】
 * - web/src/app/provider.tsx の useAuth を利用する。
 * - web/src/config/paths.ts を利用する。
 */

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { ReactNode } from 'react';
import { useEffect } from 'react';

import { useAuth } from '@/app/provider';
import { paths } from '@/config/paths';

type AuthLayoutProps = {
  children: ReactNode;
};

export function AuthLayout({ children }: AuthLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get('redirectTo');
  const { status, user } = useAuth();
  const isLoginPage = pathname === '/auth/login';
  const title = isLoginPage
    ? 'Diet Web にログイン'
    : 'Diet Web アカウントを作成';

  useEffect(() => {
    if (status === 'signed-in' && user !== null) {
      router.replace(
        `${redirectTo ? `${decodeURIComponent(redirectTo)}` : paths.app.root.getHref()}`,
      );
    }
  }, [status, user, router, redirectTo]);

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-copy">
          <h1>{title}</h1>
        </div>

        <div className="auth-toggle" aria-label="認証ページ切り替え">
          <Link
            className={isLoginPage ? 'tab-link tab-link--active' : 'tab-link'}
            href={paths.auth.login.getHref(redirectTo)}
          >
            ログイン
          </Link>
          <Link
            className={isLoginPage ? 'tab-link' : 'tab-link tab-link--active'}
            href={paths.auth.register.getHref(redirectTo)}
          >
            新規登録
          </Link>
        </div>

        {children}
      </section>
    </main>
  );
}
