/* 【責務】
 * Foods 編集フォームの空の食品入力行を生成する。
 */

import type { MealFoodItemValues } from '@/features/shared/meal-editor/schemas';

export function createEmptyFoodEntryItem(): MealFoodItemValues {
  return {
    name: '',
    amount: '1人前',
    kcal: '0',
    protein: '0',
    fat: '0',
    carbs: '0',
  };
}
