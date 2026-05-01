/* 【責務】
 * History 画面から履歴食事更新処理を呼び出す。
 */

import { getSupabaseBrowserClient } from '@/lib/supabase';

import { updateHistoryMealRecord } from '../server/update-history-meal-record';
import { buildHistoryMealUpdatePayload } from '../utils/update';

type HistoryEditableItem = {
  name: string;
  amount: string;
  kcal: string;
  protein: string;
  fat: string;
  carbs: string;
};

type UpdateHistoryMealParams = {
  mealId: string;
  mealName: string;
  items: HistoryEditableItem[];
};

export async function updateHistoryMeal({
  mealId,
  mealName,
  items,
}: UpdateHistoryMealParams): Promise<void> {
  const client = getSupabaseBrowserClient();
  const { data: userData, error: userError } = await client.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  const userId = userData.user?.id;

  if (!userId) {
    throw new Error('ログイン状態を確認できません。');
  }

  const payload = buildHistoryMealUpdatePayload({ mealName, items });

  await updateHistoryMealRecord({ client, mealId, userId, payload });
}
