/**
 * web/src/features/history/list-history-meals.ts
 *
 * 【責務】
 * History 画面向けに指定日付の meals を Supabase から取得する。
 *
 * 【使用されるエージェント / 処理フロー】
 * - use-history-screen.ts から呼ばれる。
 * - auth user と日付キーをもとに meals を問い合わせる。
 *
 * 【やらないこと】
 * - UI 描画
 * - SWR 状態管理
 * - 永続化
 *
 * 【他ファイルとの関係】
 * - getSupabaseBrowserClient と map-web-meal-row.ts を利用する。
 */

import type { WebMeal } from '@/domain/web-diet-schema';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { getUtcRangeForDateKey } from '@/lib/web-date';

import { mapWebMealRow } from './map-web-meal-row';

export async function listHistoryMeals(dateKey: string): Promise<WebMeal[]> {
  const client = getSupabaseBrowserClient();
  const { data: userData, error: userError } = await client.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  const userId = userData.user?.id;

  if (!userId) {
    return [];
  }

  const { start, end } = getUtcRangeForDateKey(dateKey);
  const { data, error } = await client
    .from('meals')
    .select('*')
    .eq('user_id', userId)
    .gte('timestamp', start)
    .lt('timestamp', end)
    .order('timestamp', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapWebMealRow);
}
