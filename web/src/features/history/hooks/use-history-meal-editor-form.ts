/* 【責務】
 * History 編集パネル向けの React Hook Form 設定を提供する。
 */

import { useForm, type UseFormReturn } from 'react-hook-form';

import type { WebMeal } from '@/domain/web-diet-schema';

import type { HistoryMealEditorFormValues } from '../schemas/history-meal-editor-form-schema';
import { createHistoryMealEditorDefaultValues } from '../utils/create-history-meal-editor-default-values';

export function useHistoryMealEditorForm(
  meal: WebMeal,
): UseFormReturn<HistoryMealEditorFormValues> {
  return useForm<HistoryMealEditorFormValues>({
    defaultValues: createHistoryMealEditorDefaultValues(meal),
  });
}
