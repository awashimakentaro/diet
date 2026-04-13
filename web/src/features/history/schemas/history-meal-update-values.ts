/* 【責務】
 * History の食事更新時に扱う入力値の型を定義する。
 */

import type { HistoryMealEditorFormValues } from './history-meal-editor-form-schema';

export type HistoryMealUpdateValues = Pick<
  HistoryMealEditorFormValues,
  'mealName' | 'items'
>;
