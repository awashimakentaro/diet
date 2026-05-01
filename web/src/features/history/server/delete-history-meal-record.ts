/* 【責務】
 * meals テーブルから履歴食事レコードを削除する。
 */

import type { SupabaseClient } from '@supabase/supabase-js';

type DeleteHistoryMealRecordParams = {
  client: SupabaseClient;
  mealId: string;
};

export async function deleteHistoryMealRecord({
  client,
  mealId,
}: DeleteHistoryMealRecordParams): Promise<void> {
  const { error } = await client.from('meals').delete().eq('id', mealId);

  if (error) {
    throw new Error(error.message);
  }
}
