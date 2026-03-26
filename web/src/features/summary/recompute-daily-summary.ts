/**
 * web/src/features/summary/recompute-daily-summary.ts
 *
 * 【責務】
 * 指定日付の meals から daily_summaries を再計算して upsert する。
 *
 * 【使用されるエージェント / 処理フロー】
 * - meals の保存・更新・削除処理から呼ばれる。
 * - 当該日の meals を再集計し、daily_summaries を更新または削除する。
 *
 * 【やらないこと】
 * - UI 描画
 * - 画面遷移
 * - 履歴明細の削除
 *
 * 【他ファイルとの関係】
 * - getSupabaseBrowserClient、web-date.ts を利用する。
 */

import { getSupabaseBrowserClient } from '@/lib/supabase';
import { getUtcRangeForDateKey } from '@/lib/web-date';

import { isDailySummarySchemaMissing } from './is-daily-summary-schema-missing';

type MealRow = {
  foods: Array<{
    name?: string;
  }> | null;
  total: {
    kcal?: number;
    protein?: number;
    fat?: number;
    carbs?: number;
  } | null;
};

function toNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.round(parsed * 10) / 10 : 0;
}

function buildTopFoods(meals: MealRow[]): Array<{ name: string; count: number }> {
  const counts = new Map<string, number>();

  meals.forEach((meal) => {
    (meal.foods ?? []).forEach((item) => {
      const name = item.name?.trim();

      if (!name) {
        return;
      }

      counts.set(name, (counts.get(name) ?? 0) + 1);
    });
  });

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));
}

export async function recomputeDailySummaryForDateKey(dateKey: string): Promise<void> {
  const client = getSupabaseBrowserClient();
  const { data: userData, error: userError } = await client.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  const userId = userData.user?.id;

  if (!userId) {
    return;
  }

  const { start, end } = getUtcRangeForDateKey(dateKey);
  const { data, error } = await client
    .from('meals')
    .select('foods,total')
    .eq('user_id', userId)
    .gte('timestamp', start)
    .lt('timestamp', end);

  if (error) {
    throw new Error(error.message);
  }

  const meals = (data ?? []) as MealRow[];

  if (meals.length === 0) {
    const { error: deleteError } = await client
      .from('daily_summaries')
      .delete()
      .eq('user_id', userId)
      .eq('date', dateKey);

    if (deleteError && !isDailySummarySchemaMissing(deleteError.message)) {
      throw new Error(deleteError.message);
    }

    return;
  }

  const totals = meals.reduce(
    (accumulator, meal) => ({
      kcal: accumulator.kcal + toNumber(meal.total?.kcal),
      protein: accumulator.protein + toNumber(meal.total?.protein),
      fat: accumulator.fat + toNumber(meal.total?.fat),
      carbs: accumulator.carbs + toNumber(meal.total?.carbs),
    }),
    { kcal: 0, protein: 0, fat: 0, carbs: 0 },
  );
  const payload = {
    user_id: userId,
    date: dateKey,
    kcal: totals.kcal,
    protein: totals.protein,
    fat: totals.fat,
    carbs: totals.carbs,
    meal_count: meals.length,
    top_foods: buildTopFoods(meals),
  };
  const { error: upsertError } = await client
    .from('daily_summaries')
    .upsert(payload, {
      onConflict: 'user_id,date',
    });

  if (upsertError) {
    if (isDailySummarySchemaMissing(upsertError.message)) {
      return;
    }

    throw new Error(upsertError.message);
  }
}
