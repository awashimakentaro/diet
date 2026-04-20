/* 【責務】
 * Record 画面の空の食品入力行を生成する。
 */

import type { MealFoodItemValues as RecordFoodItemValues } from '@/features/shared/meal-editor/schemas';

export function createEmptyRecordItem(): RecordFoodItemValues {
  return {
    name: '',
    amount: '1人前',
    kcal: '0',
    protein: '0',
    fat: '0',
    carbs: '0',
  };
}
