/* 【責務】
 * foods テーブルから食品ライブラリエントリ行を取得する。
 */

import type { SupabaseClient } from '@supabase/supabase-js';

type ListFoodLibraryEntryRecordsParams = {
  client: SupabaseClient;
  userId: string;
};

export async function listFoodLibraryEntryRecords({
  client,
  userId,
}: ListFoodLibraryEntryRecordsParams) {
  const { data, error } = await client
    .from('foods')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}
