/* 【責務】
 * History 画面から履歴食事削除処理を呼び出す。
 */

import { getSupabaseBrowserClient } from '@/lib/supabase';

import { deleteHistoryMealRecord } from '../server/delete-history-meal-record';

export async function deleteHistoryMeal(mealId: string): Promise<void> {
  const client = getSupabaseBrowserClient();
  await deleteHistoryMealRecord({ client, mealId });
}
