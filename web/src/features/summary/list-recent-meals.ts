/**
 * web/src/features/summary/list-recent-meals.ts
 *
 * 【責務】
 * Home 画面用に直近の meals を少数件取得する。
 *
 * 【使用されるエージェント / 処理フロー】
 * - Home 画面から呼ばれる。
 * - user_id をもとに meals を新しい順で取得する。
 *
 * 【やらないこと】
 * - UI 描画
 * - 永続化
 * - 日次集計更新
 *
 * 【他ファイルとの関係】
 * - getSupabaseBrowserClient を利用する。
 */

import { getSupabaseBrowserClient } from '@/lib/supabase';

type HomeRecentMeal = {
  id: string;
  name: string;
  time: string;
  kcal: number;
};

function formatMealTime(value: string): string {
  return new Intl.DateTimeFormat('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function toNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.round(parsed * 10) / 10 : 0;
}

export async function listRecentMeals(limit: number): Promise<HomeRecentMeal[]> {
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
    .from('meals')
    .select('id,menu_name,timestamp,total')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((meal) => ({
    id: meal.id,
    name: meal.menu_name,
    time: formatMealTime(meal.timestamp),
    kcal: toNumber((meal.total as { kcal?: number } | null)?.kcal),
  }));
}
