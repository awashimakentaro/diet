/* 【責務】
 * foods テーブルの食品ライブラリエントリを削除する。
 */

import type { SupabaseClient } from '@supabase/supabase-js';

type DeleteFoodLibraryEntryRecordParams = {
  client: SupabaseClient;
  entryId: string;
  userId: string;
};

export async function deleteFoodLibraryEntryRecord({
  client,
  entryId,
  userId,
}: DeleteFoodLibraryEntryRecordParams): Promise<void> {
  const { error } = await client
    .from('foods')
    .delete()
    .eq('id', entryId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(error.message);
  }
}
