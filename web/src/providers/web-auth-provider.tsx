/**
 * web/src/providers/web-auth-provider.tsx
 *
 * 【責務】
 * Web 版の Supabase 認証状態を監視し、ログイン・サインアップ・ログアウト操作を配布する。
 *
 * 【使用箇所】
 * - web/src/app/provider.tsx から全画面へ提供される。
 * - web/src/components/web-auth-screen.tsx と web/src/components/web-app-shell.tsx が利用する。
 *
 * 【やらないこと】
 * - 画面遷移の判断
 * - 認証 UI の描画
 * - 食事データの取得
 *
 * 【他ファイルとの関係】
 * - web/src/lib/supabase.ts で生成した Browser Client を利用する。
 * - web/src/app/app/layout.tsx の認証ガードと連携する。
 */

'use client';

import type {
  AuthChangeEvent,
  Session,
  User,
} from '@supabase/supabase-js';
import {
  createContext,
  type JSX,
  type PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';

import { getSupabaseBrowserClient } from '@/lib/supabase';

type AuthStatus = 'checking' | 'signed-in' | 'signed-out';

type SignInInput = {
  email: string;
  password: string;
};

type SignUpInput = {
  email: string;
  password: string;
};

type WebAuthContextValue = {
  status: AuthStatus;
  session: Session | null;
  user: User | null;
  signIn: (input: SignInInput) => Promise<void>;
  signUp: (input: SignUpInput) => Promise<{ requiresEmailConfirmation: boolean }>;
  signOut: () => Promise<void>;
};

const WebAuthContext = createContext<WebAuthContextValue | null>(null);

/**
 * 認証イベントから利用者向けの認証状態へ変換する。
 * 呼び出し元: WebAuthProvider。
 * @param session Supabase から受け取ったセッション
 * @returns 画面制御に利用する認証状態
 * @remarks 副作用は存在しない。
 */
function getAuthStatusFromSession(session: Session | null): AuthStatus {
  return session === null ? 'signed-out' : 'signed-in';
}

/**
 * Supabase 認証状態を Context として配布する。
 * 呼び出し元: AppProvider。
 * @param props.children 配下の App Router 画面
 * @returns 認証 Context Provider
 * @remarks 副作用: マウント時にセッション取得と認証イベント購読を行う。
 */
export function WebAuthProvider({ children }: PropsWithChildren): JSX.Element {
  const [status, setStatus] = useState<AuthStatus>('checking');
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    /**
     * 取得済みセッションを React state へ反映する。
     * 呼び出し元: 初期取得処理と認証イベント購読処理。
     * @param nextSession Supabase から受け取った最新セッション
     * @returns 戻り値は存在しない。
     * @remarks 副作用: status, session, user state を更新する。
     */
    function syncSession(nextSession: Session | null): void {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setStatus(getAuthStatusFromSession(nextSession));
    }

    /**
     * 初回表示時のセッションを取得する。
     * 呼び出し元: useEffect 内部。
     * @returns Promise<void>
     * @remarks 副作用: state を更新し、失敗時は signed-out 扱いにする。
     */
    async function initializeSession(): Promise<void> {
      const { data, error } = await supabase.auth.getSession();

      if (error !== null) {
        syncSession(null);
        return;
      }

      syncSession(data.session);
    }

    void initializeSession();

    const { data } = supabase.auth.onAuthStateChange(
      /**
       * 認証状態変更時に最新セッションを state へ反映する。
       * 呼び出し元: Supabase onAuthStateChange。
       * @param _event 認証イベント種別
       * @param nextSession 最新セッション
       * @returns 戻り値は存在しない。
       * @remarks 副作用: state を更新する。
       */
      (_event: AuthChangeEvent, nextSession: Session | null): void => {
        syncSession(nextSession);
      },
    );

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  /**
   * メールアドレスとパスワードでログインする。
   * 呼び出し元: WebAuthScreen。
   * @param input ログイン入力値
   * @returns Promise<void>
   * @remarks 副作用: Supabase へ認証リクエストを送信する。
   */
  async function signIn(input: SignInInput): Promise<void> {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword(input);

    if (error !== null) {
      throw error;
    }
  }

  /**
   * メールアドレスとパスワードでサインアップする。
   * 呼び出し元: WebAuthScreen。
   * @param input サインアップ入力値
   * @returns メール確認が必要かどうか
   * @remarks 副作用: Supabase へ登録リクエストを送信する。
   */
  async function signUp(
    input: SignUpInput,
  ): Promise<{ requiresEmailConfirmation: boolean }> {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase.auth.signUp(input);

    if (error !== null) {
      throw error;
    }

    return {
      requiresEmailConfirmation: data.session === null,
    };
  }

  /**
   * 現在のセッションを破棄してログアウトする。
   * 呼び出し元: WebAppShell。
   * @returns Promise<void>
   * @remarks 副作用: Supabase のセッションを破棄する。
   */
  async function signOut(): Promise<void> {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.signOut();

    if (error !== null) {
      throw error;
    }
  }

  return (
    <WebAuthContext.Provider
      value={{
        status,
        session,
        user,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </WebAuthContext.Provider>
  );
}

/**
 * Web 認証 Context を安全に参照する。
 * 呼び出し元: 認証状態を利用する Web 画面・コンポーネント。
 * @returns 認証状態と認証操作
 * @remarks 副作用は存在しない。Provider 外で使われた場合は例外を送出する。
 */
export function useWebAuth(): WebAuthContextValue {
  const context = useContext(WebAuthContext);

  if (context === null) {
    throw new Error('WebAuthProvider の外側で useWebAuth は利用できません。');
  }

  return context;
}
