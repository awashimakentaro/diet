/**
 * web/src/features/settings/api/get-settings-goal.ts
 *
 * 【責務】
 * 現在ログイン中ユーザーの goals を 1 件取得する。
 *
 * 【使用されるエージェント / 処理フロー】
 * - use-settings-screen.ts から呼ばれる。
 * - Supabase の goals テーブルを参照し、Settings 画面の初期値を返す。
 *
 * 【やらないこと】
 * - UI 描画
 * - 入力バリデーション
 * - profile 保存
 *
 * 【他ファイルとの関係】
 * - getSupabaseBrowserClient を利用する。
 */

import { getSupabaseBrowserClient } from '@/lib/supabase';

type SettingsGoalRow = {
  calories: number | string;
  protein: number | string;
  fat: number | string;
  carbs: number | string;
};

export async function getSettingsGoal(): Promise<SettingsGoalRow | null> {
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
    .from('goals')
    .select('calories, protein, fat, carbs')
    .eq('user_id', userId)
    .maybeSingle<SettingsGoalRow>();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
