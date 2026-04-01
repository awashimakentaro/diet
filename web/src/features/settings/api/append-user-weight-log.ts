/**
 * web/src/features/settings/api/append-user-weight-log.ts
 *
 * 【責務】
 * 現在ログイン中ユーザーの体重ログを user_weight_logs に 1 件追加する。
 *
 * 【使用されるエージェント / 処理フロー】
 * - save-user-profile.ts から呼ばれる。
 * - プロフィール保存成功後に current / target weight を履歴として追記する。
 *
 * 【やらないこと】
 * - UI 描画
 * - 目標計算
 *
 * 【他ファイルとの関係】
 * - getSupabaseBrowserClient を利用する。
 */

import { getSupabaseBrowserClient } from '@/lib/supabase';

type AppendUserWeightLogParams = {
  userId: string;
  currentWeightKg: number;
  targetWeightKg: number;
};

export async function appendUserWeightLog({
  userId,
  currentWeightKg,
  targetWeightKg,
}: AppendUserWeightLogParams): Promise<void> {
  const client = getSupabaseBrowserClient();
  const payload = {
    user_id: userId,
    current_weight_kg: currentWeightKg,
    target_weight_kg: targetWeightKg,
  };
  const { error } = await client.from('user_weight_logs').insert(payload);

  if (error) {
    throw new Error(error.message);
  }
}
