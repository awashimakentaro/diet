/* 【責務】
 * meals テーブルの履歴食事レコードを更新する。
 */

import type { SupabaseClient } from '@supabase/supabase-js';

import type { HistoryMealUpdatePayload } from '../utils/update';

type UpdateHistoryMealRecordParams = {
  client: SupabaseClient;
  mealId: string;
  userId: string;
  payload: HistoryMealUpdatePayload;
};

export async function updateHistoryMealRecord({
  client,
  mealId,
  userId,
  payload,
}: UpdateHistoryMealRecordParams): Promise<void> {
  const { error } = await client
    .from('meals')
    .update(payload)
    .eq('id', mealId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(error.message);
  }
}
