'use client';

/* 【責務】
 * Settings 画面のアカウント操作を管理する。
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { paths } from '@/config/paths';

const LOGOUT_REDIRECT_FLAG = 'pfc-tracker:logout-redirect-home';

type UseSettingsAccountParams = {
  email: string | undefined;
  signOut: () => Promise<void>;
};

export type UseSettingsAccountResult = {
  accountEmail: string;
  isSigningOut: boolean;
  handleSignOut: () => Promise<void>;
};

export function useSettingsAccount({
  email,
  signOut,
}: UseSettingsAccountParams): UseSettingsAccountResult {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut(): Promise<void> {
    try {
      setIsSigningOut(true);
      window.sessionStorage.setItem(LOGOUT_REDIRECT_FLAG, '1');
      await signOut();
      router.replace(paths.home.getHref());
    } finally {
      setIsSigningOut(false);
    }
  }

  return {
    accountEmail: email ?? 'guest@example.com',
    isSigningOut,
    handleSignOut,
  };
}
