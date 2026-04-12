/* 【責務】
 * History 編集パネル用に解析結果の食品一覧を組み立てる。
 */

import type { RecordAnalysisResponse } from '@/features/record/schemas/record-analysis-schema';

import type { HistoryMealEditorFormValues } from '../../schemas/history-meal-editor-form-schema';

export function buildHistoryAnalysisItems(
  draft: RecordAnalysisResponse,
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
