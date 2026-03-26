/**
 * web/src/components/web-app-shell.tsx
 *
 * 【責務】
 * Web 版認証後ページの共通ヘッダー、ログアウト導線、タブナビゲーションを描画する。
 *
 * 【使用箇所】
 * - web/app/record/page.tsx
 * - web/app/history/page.tsx
 * - web/app/foods/page.tsx
 * - web/app/settings/page.tsx
 *
 * 【やらないこと】
 * - データ取得
 * - 個別画面ロジック
 * - ログイン画面の描画
 *
 * 【他ファイルとの関係】
 * - 各ページから `currentPath` を受け取り、モバイル版に近い共通フレームとして利用される。
 * - web/src/app/provider.tsx のログアウト処理を利用する。
 */

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { JSX, ReactNode } from 'react';

import { useWebAuth } from '@/app/provider';

type WebAppShellProps = {
  currentPath: string;
  children: ReactNode;
};

const navigationItems = [
  { href: '/app/record', label: '記録' },
  { href: '/app/history', label: '履歴' },
  { href: '/app/foods', label: 'ライブラリ' },
  { href: '/app/settings', label: '設定' },
];

/**
 * 共通シェルを描画する。
 * 呼び出し元: Web 版の各 page.tsx。
 * @param props 現在位置とページ本文
 * @returns 共通フレーム JSX
 * @remarks 副作用は存在しない。
 */
export function WebAppShell({
  currentPath,
  children,
}: WebAppShellProps): JSX.Element {
  const router = useRouter();
  const { signOut, user } = useWebAuth();

  /**
   * ログアウトしてログイン画面へ戻す。
   * 呼び出し元: ヘッダーのログアウトボタン。
   * @returns Promise<void>
   * @remarks 副作用: Supabase セッション破棄とルーティング遷移を発生させる。
   */
  async function handleSignOut(): Promise<void> {
    await signOut();
    router.replace('/');
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-row">
          <div className="brand-block">
            <h1>PFC TRACKER</h1>
            <p>FITNESS ANALYTICS</p>
          </div>
          <div className="header-actions">
            <p className="header-user">{user?.email ?? 'Signed In'}</p>
            <button className="secondary-button" onClick={() => void handleSignOut()} type="button">
              ログアウト
            </button>
          </div>
        </div>
      </header>
      <nav className="tab-nav" aria-label="Primary">
        <div className="tab-nav__inner">
          {navigationItems.map((item) => (
            <Link
              className={item.href === currentPath ? 'tab-link tab-link--active' : 'tab-link'}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
      <main className="main-column">
        <div className="page-grid">{children}</div>
      </main>
    </div>
  );
}
