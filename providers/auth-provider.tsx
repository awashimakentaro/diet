/**
 * providers/auth-provider.tsx
 *
 * 【責務】
 * Supabase 認証セッションを監視し、React Context を通してユーザー情報とログイン/ログアウト API を提供する。
 *
 * 【使用箇所】
 * - app/_layout.tsx でアプリ全体をラップ
 * - 認証が必要なコンポーネント（SignInScreen や SettingsScreen）
 *
 * 【やらないこと】
 * - UI の描画
 * - 認証フォームの管理
 *
 * 【他ファイルとの関係】
 * - lib/supabase.ts で生成したクライアントを利用し、lib/diet-store.ts をサインアウト時にリセットする。
 */

import { Session, User } from '@supabase/supabase-js';
import React, { PropsWithChildren, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { resetDietState } from '@/lib/diet-store';
import { supabase } from '@/lib/supabase';

type AuthStatus = 'checking' | 'signed-in' | 'signed-out';

type AuthContextValue = {
  status: AuthStatus;
  session: Session | null;
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Supabase 認証状態を購読してコンテキストを提供する。
 * 呼び出し元: app/_layout。
 * @param children 下位ツリー
 */
export function AuthProvider({ children }: PropsWithChildren): JSX.Element {
  const [status, setStatus] = useState<AuthStatus>('checking');
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) {
        return;
      }
      if (error) {
        console.warn('Supabase セッションの取得に失敗しました', error.message);
      }
      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);
      setStatus(data.session ? 'signed-in' : 'signed-out');
    });
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      const nextStatus: AuthStatus = nextSession ? 'signed-in' : 'signed-out';
      setStatus(nextStatus);
      if (!nextSession) {
        resetDietState();
      }
    });
    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  /**
   * メールアドレスとパスワードでサインインする。
   * 呼び出し元: SignInScreen。
   * @param email 入力メール
   * @param password 入力パスワード
   */
  const signIn = useCallback(async (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password.trim()) {
      throw new Error('メールアドレスとパスワードを入力してください');
    }
    const { error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
    if (error) {
      throw new Error(error.message);
    }
  }, []);

  /**
   * Supabase ユーザーを新規登録する。
   * 呼び出し元: SignInScreen。
   * @param email 入力メール
   * @param password 入力パスワード
   */
  const signUp = useCallback(async (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || password.trim().length < 6) {
      throw new Error('メールアドレスを確認し、パスワードは 6 文字以上にしてください');
    }
    const { error } = await supabase.auth.signUp({ email: normalizedEmail, password });
    if (error) {
      throw new Error(error.message);
    }
  }, []);

  /**
   * 現在のセッションを終了する。
   * 呼び出し元: SettingsScreen。
   */
  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
    resetDietState();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ status, session, user, signIn, signUp, signOut }),
    [session, signIn, signOut, signUp, status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * AuthContext を取得するカスタムフック。
 * 呼び出し元: 認証が必要なコンポーネント全般。
 * @returns AuthContextValue
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('AuthProvider でラップされたコンポーネント内で useAuth を呼び出してください');
  }
  return ctx;
}
