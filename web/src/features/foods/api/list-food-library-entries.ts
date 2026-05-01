/* 【責務】
 * Foods 画面から食品ライブラリエントリ取得処理を呼び出す。
 */

import { getSupabaseBrowserClient } from '@/lib/supabase';

import { mapWebFoodRow } from '../utils/map-web-food-row';
import { listFoodLibraryEntryRecords } from '../server/list-food-library-entry-records';

export async function listFoodLibraryEntries(): Promise<
Array<ReturnType<typeof mapWebFoodRow>>
> {
  const client = getSupabaseBrowserClient();
  const { data: userData, error: userError } = await client.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  const userId = userData.user?.id;

  if (!userId) {
    return [];
  }

  const data = await listFoodLibraryEntryRecords({ client, userId });

  return data.map(mapWebFoodRow);
}
