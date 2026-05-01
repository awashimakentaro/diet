/* 【責務】
 * History の食事を foods テーブルへ保存する。
 */

import type { SupabaseClient } from '@supabase/supabase-js';

import type { WebMeal } from '@/domain/web-diet-schema';

type SaveHistoryMealFoodRecordParams = {
  client: SupabaseClient;
  userId: string;
  meal: WebMeal;
};

export async function saveHistoryMealFoodRecord({
  client,
  userId,
  meal,
}: SaveHistoryMealFoodRecordParams): Promise<void> {
  const payload = {
    user_id: userId,
    name: meal.menuName,
    amount: '1人前',
    calories: meal.totals.kcal,
    protein: meal.totals.protein,
    fat: meal.totals.fat,
    carbs: meal.totals.carbs,
    items: meal.items,
  };
  const { error } = await client.from('foods').insert(payload);

  if (error) {
    throw new Error(error.message);
  }
}
