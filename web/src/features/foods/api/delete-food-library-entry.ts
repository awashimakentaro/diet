/* 【責務】
 * Foods 画面から食品ライブラリエントリ削除処理を呼び出す。
 */

import { getSupabaseBrowserClient } from '@/lib/supabase';

import { deleteFoodLibraryEntryRecord } from '../server/delete-food-library-entry-record';

export async function deleteFoodLibraryEntry(entryId: string): Promise<void> {
  const client = getSupabaseBrowserClient();
  const { data: userData, error: userError } = await client.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  const userId = userData.user?.id;

  if (!userId) {
    throw new Error('ログイン状態を確認できません。');
  }

  await deleteFoodLibraryEntryRecord({ client, entryId, userId });
}
