'use client';

/* 【責務】
 * `/app/*` 配下の画面を認証付きレイアウトとして描画する。
 */

import type { JSX, ReactNode } from 'react';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { useWebAuth } from '@/app/provider';
import { AppBottomNav } from '@/components/app-bottom-nav';
import { AppTopBar } from '@/components/app-top-bar';
import { paths } from '@/config/paths';

type AuthenticatedAppLayoutProps = {
  children: ReactNode;
};

/**
 * 現在の `/app/*` URL をログイン後の復帰先として組み立てる。
 * 呼び出し元: AuthenticatedAppLayout。
 * @param pathname 現在の pathname
 * @returns ログイン後に戻す完全な相対パス
 * @remarks 副作用は存在しない。
 */
function buildRedirectPath(pathname: string): string {
  return pathname;
}

/**
 * `/app/*` 配下を認証付きレイアウトとして描画する。
 * 呼び出し元: Next.js App Router。
 * @param props.children 保護対象ページ
 * @returns 認証済みページまたは確認中 UI
 * @remarks 副作用: 未認証時にログイン画面へリダイレクトする。
 */
export default function AuthenticatedAppLayout({
  children,
}: AuthenticatedAppLayoutProps): JSX.Element {
  const pathname = usePathname();
  const router = useRouter();
  const { status } = useWebAuth();
  const redirectPath = buildRedirectPath(pathname);

  useEffect(() => {
    if (status === 'signed-out') {
      router.replace(paths.auth.login.getHref(redirectPath));
    }
  }, [redirectPath, router, status]);

  if (status === 'checking') {
    return (
      <div className="app-session-check">
        <AppTopBar />
        <main className="app-session-check__main" aria-live="polite">
          <section className="app-session-check__panel">
            <div className="app-session-check__orb" aria-hidden="true">
              <span className="app-session-check__spinner" />
            </div>
            <div className="app-session-check__copy">
              <p className="app-session-check__eyebrow">PFC TRACKER</p>
              <h1>セッションを確認中</h1>
              <p>今日の記録へ戻る準備をしています。</p>
            </div>
          </section>
        </main>
      </div>
    );
  }

  if (status === 'signed-out') {
    return (
      <main className="auth-page">
        <section className="auth-card auth-card--compact">
          <p className="eyebrow">ログインへ移動中</p>
          <h1>認証画面へ戻ります</h1>
          <p>ログイン後は、元のページへ自動的に戻ります。</p>
        </section>
      </main>
    );
  }

  return (
    <>
      {children}
      <AppBottomNav currentPath={pathname} />
    </>
  );
}
