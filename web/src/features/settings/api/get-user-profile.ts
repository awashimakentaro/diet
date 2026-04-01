/**
 * web/src/features/settings/api/get-user-profile.ts
 *
 * 【責務】
 * 現在ログイン中ユーザーの user_profiles を 1 件取得する。
 *
 * 【使用されるエージェント / 処理フロー】
 * - use-settings-screen.ts などから呼ばれる。
 * - Supabase の user_profiles を参照して Settings 初期値を返す。
 *
 * 【やらないこと】
 * - UI 描画
 * - 入力バリデーション
 * - goals 保存
 *
 * 【他ファイルとの関係】
 * - getSupabaseBrowserClient を利用する。
 */

import { getSupabaseBrowserClient } from '@/lib/supabase';

export type UserProfileRow = {
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  gender: string | null;
  age: number | null;
  height_cm: number | string | null;
  current_weight_kg: number | string | null;
  target_weight_kg: number | string | null;
  target_days: number | null;
  activity_level: string | null;
};

export async function getUserProfile(): Promise<UserProfileRow | null> {
  const client = getSupabaseBrowserClient();
  const { data: userData, error: userError } = await client.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  const userId = userData.user?.id;

  if (!userId) {
    return null;
  }

  const { data, error } = await client
    .from('user_profiles')
    .select([
      'username',
      'display_name',
      'bio',
      'avatar_url',
      'gender',
      'age',
      'height_cm',
      'current_weight_kg',
      'target_weight_kg',
      'target_days',
      'activity_level',
    ].join(', '))
    .eq('user_id', userId)
    .maybeSingle<UserProfileRow>();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
