/**
 * web/src/features/settings/list-current-goal.ts
 *
 * 【責務】
 * 現在ログイン中ユーザーの goals を表示用 WebGoal として取得する。
 *
 * 【使用されるエージェント / 処理フロー】
 * - Home / History の栄養状況表示から呼ばれる。
 * - goals テーブルを参照して表示用の目標値を返す。
 *
 * 【やらないこと】
 * - UI 描画
 * - goals 保存
 * - profile 保存
 *
 * 【他ファイルとの関係】
 * - getSupabaseBrowserClient を利用する。
 * - web-diet-schema.ts の WebGoal を返す。
 */

import { mockGoal } from '@/data/mock-diet-data';
import type { WebGoal } from '@/domain/web-diet-schema';
import { getSupabaseBrowserClient } from '@/lib/supabase';

function toNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.round(parsed * 10) / 10 : 0;
}

export async function listCurrentGoal(): Promise<WebGoal | null> {
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
    .select('calories, protein, fat, carbs, updated_at')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (data === null) {
    return null;
  }

  return {
    source: mockGoal.source,
    updatedAt: typeof data.updated_at === 'string' ? data.updated_at : mockGoal.updatedAt,
    totals: {
      kcal: toNumber(data.calories),
      protein: toNumber(data.protein),
      fat: toNumber(data.fat),
      carbs: toNumber(data.carbs),
    },
  };
}
