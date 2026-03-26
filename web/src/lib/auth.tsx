"use client";

import useSWR from "swr";
import { z } from "zod";
import { getSupabaseBrowserClient } from "./supabase";
import type { User } from '@supabase/supabase-js';
const supabase = getSupabaseBrowserClient();

export const getUser = async () => {
  const { data, error } = await supabase.auth.getUser();
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
