/* 【責務】
 * foods テーブルの食品ライブラリエントリを更新する。
 */

import type { SupabaseClient } from '@supabase/supabase-js';

import type { FoodLibraryEntryUpdatePayload } from '../utils/update-food-library-entry';

type UpdateFoodLibraryEntryRecordParams = {
  client: SupabaseClient;
  entryId: string;
  userId: string;
  payload: FoodLibraryEntryUpdatePayload;
};

export async function updateFoodLibraryEntryRecord({
  client,
  entryId,
  userId,
  payload,
}: UpdateFoodLibraryEntryRecordParams): Promise<void> {
  const { error } = await client
    .from('foods')
    .update(payload)
    .eq('id', entryId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(error.message);
  }
}
