'use client';

/**
 * web/src/features/account/use-account-sheet.ts
 *
 * 【責務】
 * アカウント編集シートの開閉、入力 state、保存とログアウト処理をまとめる。
 *
 * 【使用されるエージェント / 処理フロー】
 * - app-top-bar.tsx から呼ばれる。
 * - get-user-profile.ts で初期値を読み込み、save-account-profile.ts で保存する。
 *
 * 【やらないこと】
 * - JSX 描画
 * - CSS 定義
 * - 体格目標の更新
 *
 * 【他ファイルとの関係】
 * - get-user-profile.ts、save-account-profile.ts、app/provider.tsx を利用する。
 */

import { useEffect, useState } from 'react';

import { useWebAuth } from '@/app/provider';
import { getUserProfile } from '@/features/settings/get-user-profile';

import { saveAccountProfile } from './save-account-profile';

type AccountFormValues = {
  username: string;
  displayName: string;
  bio: string;
};

export type UseAccountSheetResult = {
  email: string;
  isOpen: boolean;
  isLoadingProfile: boolean;
  isSaving: boolean;
  isSigningOut: boolean;
  saveStatus: 'idle' | 'saving' | 'success' | 'error';
  feedbackMessage: string | null;
  values: AccountFormValues;
  openSheet: () => void;
  closeSheet: () => void;
  handleValueChange: (field: keyof AccountFormValues, value: string) => void;
  handleSave: () => Promise<void>;
  handleSignOut: () => Promise<void>;
};

function sanitizeEmailPrefix(email: string | undefined): string {
  const localPart = (email ?? 'guest').split('@')[0] ?? 'guest';
  const sanitized = localPart.toLowerCase().replace(/[^a-z0-9_]/g, '_');
  return sanitized.length >= 3 ? sanitized : `user_${sanitized}`.slice(0, 24);
}

export function useAccountSheet(): UseAccountSheetResult {
  const { user, signOut } = useWebAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [values, setValues] = useState<AccountFormValues>({
    username: sanitizeEmailPrefix(user?.email),
    displayName: '',
    bio: '',
  });

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    let isMounted = true;

    async function loadProfile(): Promise<void> {
      try {
        setIsLoadingProfile(true);
        const profile = await getUserProfile();

        if (!isMounted || profile === null) {
          return;
        }

        setValues({
          username: profile.username,
          displayName: profile.display_name ?? '',
          bio: profile.bio ?? '',
        });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setFeedbackMessage(error instanceof Error ? error.message : 'アカウント情報の取得に失敗しました。');
      } finally {
        if (isMounted) {
          setIsLoadingProfile(false);
        }
      }
    }

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, [user?.email, user?.id]);

  function openSheet(): void {
    setFeedbackMessage(null);
    setSaveStatus('idle');
    setIsOpen(true);
  }

  function closeSheet(): void {
    setIsOpen(false);
  }

  function handleValueChange(field: keyof AccountFormValues, value: string): void {
    setSaveStatus('idle');
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function handleSave(): Promise<void> {
    try {
      setIsSaving(true);
      setSaveStatus('saving');
      setFeedbackMessage(null);
      await saveAccountProfile({
        username: values.username,
        displayName: values.displayName,
        bio: values.bio,
      });
      setSaveStatus('success');
    } catch (error) {
      setSaveStatus('error');
      setFeedbackMessage(error instanceof Error ? error.message : '保存に失敗しました。');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSignOut(): Promise<void> {
    try {
      setIsSigningOut(true);
      await signOut();
      setIsOpen(false);
    } finally {
      setIsSigningOut(false);
    }
  }

  return {
    email: user?.email ?? 'guest@example.com',
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
  };
}
