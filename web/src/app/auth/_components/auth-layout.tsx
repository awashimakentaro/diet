'use client';

/*
 * 【責務】
 * `/auth/*` ルート専用の認証レイアウトを描画し、ログイン済みユーザーを適切な遷移先へ戻す。
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
    ? 'ログイン'
    : '新規登録';
  const lead = isLoginPage
    ? '食事記録の続きを開く。'
    : '面倒な食事管理を軽く始める。';

  useEffect(() => {
    if (status === 'signed-in' && user !== null) {
      router.replace(
        `${redirectTo ? `${decodeURIComponent(redirectTo)}` : paths.app.root.getHref()}`,
      );
    }
  }, [status, user, router, redirectTo]);

  return (
    <main className="auth-page">
      <div className="auth-pop auth-pop--left">早く登録して！</div>
      <div className="auth-pop auth-pop--right">早くログインして！</div>
      <div className="auth-emoji auth-emoji--top">💪</div>
      <div className="auth-emoji auth-emoji--bottom">🔥</div>

      <section className="auth-shell">
        <section className="auth-card">
          <Link className="auth-brand auth-brand--card" href={paths.home.getHref()}>
            PFC TRACKER
          </Link>

          <div className="auth-copy">
            <h1>{title}</h1>
            <p>{lead}</p>
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
      </section>
    </main>
  );
}
