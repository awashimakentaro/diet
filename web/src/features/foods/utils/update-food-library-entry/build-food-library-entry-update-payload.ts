/* 【責務】
 * Foods 編集フォーム値を foods 更新 payload へ変換する。
 */

import type { MealFormValues } from '@/features/shared/meal-editor/schemas';

type BuildFoodLibraryEntryUpdatePayloadParams = {
  mealName: string;
  items: MealFormValues['items'];
};

export type FoodLibraryEntryItemPayload = {
  id: string;
  name: string;
  amount: string;
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
};

export type FoodLibraryEntryUpdatePayload = {
  name: string;
  amount: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  items: FoodLibraryEntryItemPayload[];
};

function toFoodNumber(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.round(parsed * 10) / 10 : 0;
}

function createFoodItemId(index: number): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `food-item-${Date.now()}-${index + 1}`;
}

function buildFoodItems(items: MealFormValues['items']): FoodLibraryEntryItemPayload[] {
  return items
    .filter((item) => item.name.trim().length > 0)
    .map((item, index) => ({
      id: createFoodItemId(index),
      name: item.name.trim(),
      amount: item.amount.trim() || '1人前',
      kcal: toFoodNumber(item.kcal),
      protein: toFoodNumber(item.protein),
      fat: toFoodNumber(item.fat),
      carbs: toFoodNumber(item.carbs),
    }));
}

function buildFoodTotals(items: FoodLibraryEntryItemPayload[]) {
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

export function buildFoodLibraryEntryUpdatePayload({
  mealName,
  items,
}: BuildFoodLibraryEntryUpdatePayloadParams): FoodLibraryEntryUpdatePayload {
  const normalizedItems = buildFoodItems(items);

  if (normalizedItems.length === 0) {
    throw new Error('食品を1件以上入力してください。');
  }

  const totals = buildFoodTotals(normalizedItems);

  return {
    name: mealName.trim() || normalizedItems[0]?.name || '名称未設定',
    amount: normalizedItems[0]?.amount || '1人前',
    calories: totals.kcal,
    protein: totals.protein,
    fat: totals.fat,
    carbs: totals.carbs,
    items: normalizedItems,
  };
}
