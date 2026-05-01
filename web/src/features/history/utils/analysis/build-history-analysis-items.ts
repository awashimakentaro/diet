/* 【責務】
 * History 編集パネル用に解析結果の食品一覧を組み立てる。
 */

import type { MealAnalysisResponse } from '@/features/shared/meal-analysis/schemas';

import type { HistoryMealEditorFormValues } from '../../schemas/history-meal-editor-form-schema';

export function buildHistoryAnalysisItems(
  draft: MealAnalysisResponse,
): HistoryMealEditorFormValues['items'] {
  return draft.items.map((item) => ({
    name: item.name,
    amount: item.amount,
    kcal: String(item.kcal),
    protein: String(item.protein),
    fat: String(item.fat),
    carbs: String(item.carbs),
  }));
}
