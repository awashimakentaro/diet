/* 【責務】
 * History 編集パネルの初期フォーム値を生成する。
 */

import type { WebMeal } from '@/domain/web-diet-schema';

import type { HistoryMealEditorFormValues } from '../schemas/history-meal-editor-form-schema';
import { createEmptyHistoryMealItem } from './create-empty-history-meal-item';

function toStringNumber(value: number): string {
  return Number.isFinite(value) ? String(value) : '0';
}

export function createHistoryMealEditorDefaultValues(
  meal: WebMeal,
): HistoryMealEditorFormValues {
  return {
    mealName: meal.menuName,
    prompt: '',
    items: meal.items.length > 0
      ? meal.items.map((item) => ({
        name: item.name,
        amount: item.amount,
        kcal: toStringNumber(item.kcal),
        protein: toStringNumber(item.protein),
        fat: toStringNumber(item.fat),
        carbs: toStringNumber(item.carbs),
      }))
      : [createEmptyHistoryMealItem()],
  };
}
