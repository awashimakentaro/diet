/**
 * web/src/components/app-top-bar.tsx
 *
 * 【責務】
 * Web アプリ共通のトップバーを描画する。
 *
 * 【使用されるエージェント / 処理フロー】
 * - record / history / foods / settings 画面から呼ばれる。
 * - app/provider.tsx の認証状態からユーザー表示とログアウト操作を組み立てる。
 *
 * 【やらないこと】
 * - 認証処理
 * - 画面遷移
 * - ページ固有の状態管理
 *
 * 【他ファイルとの関係】
 * - web/src/app/provider.tsx の useWebAuth を利用する。
 * - web/src/styles/globals.css の app-top-bar 系クラスに依存する。
 */

'use client';

import { LogOut } from 'lucide-react';
import type { JSX } from 'react';

import { useWebAuth } from '@/app/provider';

function getUserInitial(email: string | undefined): string {
  if (!email) {
    return 'G';
  }

  return email.slice(0, 1).toUpperCase();
}

export function AppTopBar(): JSX.Element {
  const { signOut, user } = useWebAuth();
  const userInitial = getUserInitial(user?.email);

  return (
    <header className="app-top-bar">
      <div className="app-top-bar__brand">
        <h1>PFC TRACKER</h1>
      </div>

      <div className="app-top-bar__actions">
        <div
          aria-label={user?.email ?? 'guest user'}
          className="app-top-bar__avatar"
          role="img"
          title={user?.email ?? 'guest user'}
        >
          {userInitial}
        </div>

        <button
          aria-label="ログアウト"
          className="app-top-bar__logout"
          onClick={() => {
            void signOut();
          }}
          type="button"
        >
          <LogOut size={16} strokeWidth={2.2} />
        </button>
      </div>
    </header>
  );
}
