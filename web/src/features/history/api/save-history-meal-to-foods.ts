/* 【責務】
 * History 画面から食事の食品ライブラリ保存処理を呼び出す。
 */

import type { WebMeal } from '@/domain/web-diet-schema';
import { getSupabaseBrowserClient } from '@/lib/supabase';

import { saveHistoryMealFoodRecord } from '../server/save-history-meal-food-record';

export async function saveHistoryMealToFoods(meal: WebMeal): Promise<void> {
  const client = getSupabaseBrowserClient();
  const { data: userData, error: userError } = await client.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  const userId = userData.user?.id;

  if (!userId) {
    throw new Error('ログイン状態を確認できません。');
  }

  await saveHistoryMealFoodRecord({ client, userId, meal });
}
