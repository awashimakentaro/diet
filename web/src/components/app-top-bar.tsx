/*
 * 【責務】
 * Web アプリ共通のトップバーとアカウント編集シートの起動導線を描画する。
 */

'use client';

import Link from 'next/link';
import type { JSX } from 'react';

import { useWebAuth } from '@/app/provider';
import { paths } from '@/config/paths';
import { AccountAvatarBadge } from '@/features/account/account-avatar-badge';
import { AccountSheet } from '@/features/account/account-sheet';
import { useAccountSheet } from '@/features/account/use-account-sheet';

export function AppTopBar(): JSX.Element {
  const { status } = useWebAuth();
  const {
    email,
    isOpen,
    isLoadingProfile,
    isSaving,
    isSigningOut,
    saveStatus,
    feedbackMessage,
    values,
    openSheet,
    closeSheet,
    handleValueChange,
    handleSave,
    handleSignOut,
  } = useAccountSheet();

  return (
    <>
      <header className="app-top-bar">
        <div className="app-top-bar__brand">
          <Link className="app-top-bar__brand-link" href={paths.app.root.getHref()}>
            <h1>PFC TRACKER</h1>
          </Link>
        </div>

        {status === 'signed-in' || status === 'checking' ? (
          <button
            aria-label="アカウントを編集"
            aria-busy={status === 'checking'}
            className={status === 'checking' ? 'app-top-bar__avatar-button app-top-bar__avatar-button--checking' : 'app-top-bar__avatar-button'}
            disabled={status === 'checking'}
            onClick={status === 'signed-in' ? openSheet : undefined}
            type="button"
          >
            <AccountAvatarBadge />
          </button>
        ) : (
          <div className="app-top-bar__guest-actions">
            <Link
              className="app-top-bar__auth-link app-top-bar__auth-link--secondary"
              href={paths.auth.login.getHref()}
            >
              ログイン
            </Link>
            <Link
              className="app-top-bar__auth-link app-top-bar__auth-link--primary"
              href={paths.auth.register.getHref()}
            >
              新規登録
            </Link>
          </div>
        )}
      </header>

      {status === 'signed-in' ? (
        <AccountSheet
          email={email}
          feedbackMessage={feedbackMessage}
          isLoadingProfile={isLoadingProfile}
          isOpen={isOpen}
          isSaving={isSaving}
          isSigningOut={isSigningOut}
          saveStatus={saveStatus}
          onClose={closeSheet}
          onSave={handleSave}
          onSignOut={handleSignOut}
          onValueChange={handleValueChange}
          values={values}
        />
      ) : null}
    </>
  );
}
