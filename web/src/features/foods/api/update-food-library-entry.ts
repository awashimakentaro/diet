/* 【責務】
 * Foods 画面から食品ライブラリエントリ更新処理を呼び出す。
 */

import type { MealFormValues } from '@/features/shared/meal-editor/schemas';
import { getSupabaseBrowserClient } from '@/lib/supabase';

import { updateFoodLibraryEntryRecord } from '../server/update-food-library-entry-record';
import { buildFoodLibraryEntryUpdatePayload } from '../utils/update-food-library-entry';

type UpdateFoodLibraryEntryParams = {
  entryId: string;
  mealName: string;
  items: MealFormValues['items'];
};

export async function updateFoodLibraryEntry({
  entryId,
  mealName,
  items,
}: UpdateFoodLibraryEntryParams): Promise<void> {
  const client = getSupabaseBrowserClient();
  const { data: userData, error: userError } = await client.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  const userId = userData.user?.id;

  if (!userId) {
    throw new Error('ログイン状態を確認できません。');
  }

  const payload = buildFoodLibraryEntryUpdatePayload({ mealName, items });

  await updateFoodLibraryEntryRecord({ client, entryId, userId, payload });
}
