/**
 * web/src/features/settings/save-settings-goal.ts
 *
 * 【責務】
 * Settings 画面の目標値を goals テーブルへ upsert 保存する。
 *
 * 【使用されるエージェント / 処理フロー】
 * - use-settings-screen.ts から呼ばれる。
 * - 入力済み kcal / PFC を認証ユーザーに紐づけて保存する。
 *
 * 【やらないこと】
 * - UI 描画
 * - 自動計算
 * - profile 保存
 *
 * 【他ファイルとの関係】
 * - getSupabaseBrowserClient を利用する。
 */

import { getSupabaseBrowserClient } from '@/lib/supabase';

type SaveSettingsGoalParams = {
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
};

export async function saveSettingsGoal({
  kcal,
  protein,
  fat,
  carbs,
}: SaveSettingsGoalParams): Promise<void> {
  const client = getSupabaseBrowserClient();
  const { data: userData, error: userError } = await client.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  const userId = userData.user?.id;

  if (!userId) {
    throw new Error('ログイン状態を確認できません。');
  }

  const payload = {
    user_id: userId,
    calories: kcal,
    protein,
    fat,
    carbs,
  };

  const { error } = await client.from('goals').upsert(payload, {
    onConflict: 'user_id',
  });

  if (error) {
    throw new Error(error.message);
  }
}
