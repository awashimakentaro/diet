/**
 * web/src/features/foods/api/update-food-library-entry.ts
 *
 * 【責務】
 * foods テーブルの既存エントリを更新する。
 *
 * 【使用されるエージェント / 処理フロー】
 * - use-foods-screen.ts から呼ばれる。
 * - 編集フォーム値を foods の update payload へ変換して保存する。
 *
 * 【やらないこと】
 * - UI 描画
 * - form state 管理
 *
 * 【他ファイルとの関係】
 * - getSupabaseBrowserClient を利用する。
 */

import type { MealFormValues } from '@/features/shared/meal-editor/schemas';
import { getSupabaseBrowserClient } from '@/lib/supabase';

type UpdateFoodLibraryEntryParams = {
  entryId: string;
  mealName: string;
  items: MealFormValues['items'];
};

type FoodItemPayload = {
  id: string;
  name: string;
  amount: string;
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
};

function toNumber(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.round(parsed * 10) / 10 : 0;
}

function createItemId(index: number): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `food-item-${Date.now()}-${index + 1}`;
}

function buildItems(items: MealFormValues['items']): FoodItemPayload[] {
  return items
    .filter((item) => item.name.trim().length > 0)
    .map((item, index) => ({
      id: createItemId(index),
      name: item.name.trim(),
      amount: item.amount.trim() || '1人前',
      kcal: toNumber(item.kcal),
      protein: toNumber(item.protein),
      fat: toNumber(item.fat),
      carbs: toNumber(item.carbs),
    }));
}

function buildTotals(items: FoodItemPayload[]) {
  return items.reduce(
    (totals, item) => ({
      kcal: totals.kcal + item.kcal,
      protein: totals.protein + item.protein,
      fat: totals.fat + item.fat,
      carbs: totals.carbs + item.carbs,
    }),
    { kcal: 0, protein: 0, fat: 0, carbs: 0 },
  );
}

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

  const normalizedItems = buildItems(items);

  if (normalizedItems.length === 0) {
    throw new Error('食品を1件以上入力してください。');
  }

  const totals = buildTotals(normalizedItems);
  const payload = {
    name: mealName.trim() || normalizedItems[0]?.name || '名称未設定',
    amount: normalizedItems[0]?.amount || '1人前',
    calories: totals.kcal,
    protein: totals.protein,
    fat: totals.fat,
    carbs: totals.carbs,
    items: normalizedItems,
  };

  const { error } = await client
    .from('foods')
    .update(payload)
    .eq('id', entryId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(error.message);
  }
}
