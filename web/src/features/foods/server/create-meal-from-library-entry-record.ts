/* 【責務】
 * 食品ライブラリエントリを meals テーブルへ保存する。
 */

import type { SupabaseClient } from '@supabase/supabase-js';

import type { WebLibraryEntry } from '@/domain/web-diet-schema';

type CreateMealFromLibraryEntryRecordParams = {
  client: SupabaseClient;
  userId: string;
  entry: WebLibraryEntry;
};

function buildMealPayload({
  userId,
  entry,
}: Pick<CreateMealFromLibraryEntryRecordParams, 'userId' | 'entry'>) {
  return {
    user_id: userId,
    menu_name: entry.name,
    original_text: entry.description,
    source: 'library',
    foods: entry.items.map((item) => ({
      id: item.id,
      name: item.name,
      amount: item.amount,
      kcal: item.kcal,
      protein: item.protein,
      fat: item.fat,
      carbs: item.carbs,
    })),
    total: {
      kcal: entry.totals.kcal,
      protein: entry.totals.protein,
      fat: entry.totals.fat,
      carbs: entry.totals.carbs,
    },
  };
}

export async function createMealFromLibraryEntryRecord({
  client,
  userId,
  entry,
}: CreateMealFromLibraryEntryRecordParams): Promise<void> {
  const payload = buildMealPayload({ userId, entry });
  const { error } = await client.from('meals').insert(payload);

  if (!error) {
    return;
  }

  const fallbackPayload = {
    user_id: payload.user_id,
    menu_name: payload.menu_name,
    original_text: payload.original_text,
    foods: payload.foods,
    total: payload.total,
  };
  const { error: fallbackError } = await client.from('meals').insert(fallbackPayload);

  if (fallbackError) {
    throw new Error(fallbackError.message);
  }
}
