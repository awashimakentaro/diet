/**
 * web/src/lib/supabase.ts
 *
 * 【責務】
 * Web 版で利用する Supabase Browser Client を生成し、再利用可能な形で提供する。
 *
 * 【使用箇所】
 * - web/src/providers/web-auth-provider.tsx から認証 API を呼び出す際に利用される。
 *
 * 【やらないこと】
 * - 認証状態の保持
 * - UI 描画
 * - サーバーサイド用 Client の生成
 *
 * 【他ファイルとの関係】
 * - web/.env.example に定義する公開環境変数を参照する。
 * - web/src/providers/web-auth-provider.tsx へ Client を渡す土台となる。
 */

'use client';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

/**
 * Web ブラウザ向けの Supabase Client を返す。
 * 呼び出し元: WebAuthProvider。
 * @returns 初期化済みの Supabase Browser Client
 * @remarks 副作用: 初回呼び出し時に Client を生成してモジュール内へ保持する。
 */
export function getSupabaseBrowserClient(): SupabaseClient {
  if (supabaseClient !== null) {
    return supabaseClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl === undefined || supabaseAnonKey === undefined) {
    throw new Error('Supabase の公開環境変数が不足しています。');
  }

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return supabaseClient;
}
