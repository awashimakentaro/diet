'use client';

/**
 * web/src/app/app/layout.tsx
 *
 * 【責務】
 * `/app/*` 配下の画面を認証状態で保護し、未ログイン時はログイン画面へ戻す。
 *
 * 【使用箇所】
 * - web/src/app/app 配下の全ページで自動的に適用される。
 *
 * 【やらないこと】
 * - ログイン UI の描画
 * - 食事データの取得
 * - タブナビゲーションの描画
 *
 * 【他ファイルとの関係】
 * - web/src/providers/web-auth-provider.tsx の認証状態を参照する。
 * - 未認証時は web/src/app/page.tsx のログイン画面へ遷移させる。
 */

import type { JSX, ReactNode } from 'react';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { useWebAuth } from '@/providers/web-auth-provider';

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
      router.replace(`/?redirect=${encodeURIComponent(redirectPath)}`);
    }
  }, [redirectPath, router, status]);

  if (status === 'checking') {
    return (
      <main className="auth-page">
        <section className="auth-card auth-card--compact">
          <p className="eyebrow">認証確認中</p>
          <h1>セッションを確認しています</h1>
          <p>ログイン状態を確認した後に、要求されたページへ遷移します。</p>
        </section>
      </main>
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

  return <>{children}</>;
}
