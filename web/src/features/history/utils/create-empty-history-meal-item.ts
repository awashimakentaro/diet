/* 【責務】
 * History 編集パネルの空の食品入力行を生成する。
 */

import type { HistoryMealEditorFormValues } from '../schemas/history-meal-editor-form-schema';

export function createEmptyHistoryMealItem(): HistoryMealEditorFormValues['items'][number] {
  return {
    name: '',
    amount: '1人前',
    kcal: '0',
    protein: '0',
    fat: '0',
    carbs: '0',
  };
}
