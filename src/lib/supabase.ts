/**
 * lib/supabase.ts
 *
 * 【責務】
 * Supabase クライアントの生成と認証済みユーザー ID の取得を提供する。
 *
 * 【使用箇所】
 * - 各エージェントの DB アクセス
 *
 * 【やらないこと】
 * - ドメイン変換
 * - UI ロジック
 *
 * 【他ファイルとの関係】
 * - agents ディレクトリで import される。
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const configExtra = (Constants.expoConfig?.extra ?? {}) as { supabaseDemoUserId?: string };

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase 環境変数が設定されていません。EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY を確認してください。');
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '', {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/**
 * 現在のユーザー ID を取得する。未ログインの場合は例外を投げる。
 * @returns 認証済みユーザー ID
 */
export async function requireUserId(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  if (data.user) {
    return data.user.id;
  }
  const fallback = process.env.EXPO_PUBLIC_SUPABASE_DEMO_USER_ID || configExtra.supabaseDemoUserId;
  if (fallback) {
    return fallback;
  }
  throw new Error('Supabase へログインしてください');
}
