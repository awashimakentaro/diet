/* 【責務】
 * Supabase 認証状態の取得とログイン操作を提供する。
 */

"use client";

import useSWR from "swr";
import { z } from "zod";
import { getSupabaseBrowserClient } from "./supabase";
import type { User } from '@supabase/supabase-js';
const supabase = getSupabaseBrowserClient();

function getCachedSupabaseUser(): User | null {
  if (typeof window === 'undefined') {
    return null;
  }

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);

    if (key === null || !key.startsWith('sb-') || !key.endsWith('-auth-token')) {
      continue;
    }

    const rawValue = window.localStorage.getItem(key);

    if (rawValue === null) {
      continue;
    }

    try {
      const parsed = JSON.parse(rawValue) as { user?: User };

      if (parsed.user) {
        return parsed.user;
      }
    } catch {
      return null;
    }
  }

  return null;
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T | null> {
  return Promise.race([
    promise,
    new Promise<null>((resolve) => {
      window.setTimeout(() => resolve(null), timeoutMs);
    }),
  ]);
}

export const getUser = async () => {
  const cachedUser = getCachedSupabaseUser();

  if (cachedUser !== null) {
    return cachedUser;
  }

  const sessionResult = await withTimeout(supabase.auth.getSession(), 2500);

  if (sessionResult?.data.session?.user) {
    return sessionResult.data.session.user;
  }

  const userResult = await withTimeout(supabase.auth.getUser(), 2500);

  if (userResult === null) {
    return null;
  }

  const { data, error } = userResult;
  if (error) {
    throw new Error(error.message);
  }

  return data.user;
  //supabaseからuserの情報を取る
};

export const useUser = () => {
  return useSWR<User | null>("/auth/user", getUser);
  //getUserをreact向けに管理する
};

export const loginInputSchema = z.object({
  email: z.string().trim().toLowerCase().email("メールアドレスが不正です"),
  password: z.string().min(6, "パスワードは6文字以上です"),
});
export const signUpSchema = z.object({
  email: z.string().trim().toLowerCase().email("メールアドレスが不正です"),
  password: z.string().min(6, "パスワードは6文字以上です"),
});

export type LoginInput = z.infer<typeof loginInputSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;

export const login = async (input: LoginInput) => {
  const { email, password } = input;
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    throw new Error(error.message);
  }
  return data;
  //login処理をしたらloginができただけでuserの情報が返ってくるわけではない
  //dataにはログイン成功時の承認結果が入る　 user: {...},session: {...}　など
};

export const logout = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
  
};

export const signInWithGoogle = async (redirectTo: string) => {
  const origin = window.location.origin;
  const absoluteRedirectTo = redirectTo.startsWith('http')
    ? redirectTo
    : `${origin}${redirectTo}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: absoluteRedirectTo,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const signUp = async (input: SignUpInput) => {
  const { email, password } = input;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) {
    throw new Error(error.message);
  }
  return data;
};
