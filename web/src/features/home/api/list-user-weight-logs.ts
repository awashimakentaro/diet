/**
 * web/src/features/home/api/list-user-weight-logs.ts
 *
 * 【責務】
 * Home の体重推移グラフ用に user_weight_logs を取得する。
 *
 * 【使用されるエージェント / 処理フロー】
 * - use-home-screen.ts から呼ばれる。
 * - 認証ユーザーに紐づく最新ログを recorded_at 昇順へ整形して返す。
 *
 * 【やらないこと】
 * - UI 描画
 * - グラフ描画
 *
 * 【他ファイルとの関係】
 * - getSupabaseBrowserClient を利用する。
 */

import { getSupabaseBrowserClient } from '@/lib/supabase';

export type UserWeightLogPoint = {
  id: string;
  recordedAt: string;
  currentWeightKg: number;
  targetWeightKg: number | null;
};

function toNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.round(parsed * 10) / 10 : 0;
}

export async function listUserWeightLogs(limit = 12): Promise<UserWeightLogPoint[]> {
  const client = getSupabaseBrowserClient();
  const { data: userData, error: userError } = await client.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  const userId = userData.user?.id;

  if (!userId) {
    return [];
  }

  const { data, error } = await client
    .from('user_weight_logs')
    .select('id, recorded_at, current_weight_kg, target_weight_kg')
    .eq('user_id', userId)
    .order('recorded_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return [...(data ?? [])]
    .reverse()
    .map((row) => ({
      id: row.id as string,
      recordedAt: row.recorded_at as string,
      currentWeightKg: toNumber(row.current_weight_kg),
      targetWeightKg: row.target_weight_kg === null ? null : toNumber(row.target_weight_kg),
    }));
}
