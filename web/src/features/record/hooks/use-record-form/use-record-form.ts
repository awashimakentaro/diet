/* 【責務】
 * Record 画面向けの React Hook Form 設定と初期下書きを提供する。
 */

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type UseFormReturn } from 'react-hook-form';

import {
  mealFormSchema as recordFormSchema,
  type MealFormValues as RecordFormValues,
} from '@/features/shared/meal-editor/schemas';
import { createRecordFormDefaultValues } from '../../utils/create-record-form-default-values';

export function useRecordForm(): UseFormReturn<RecordFormValues> {
  return useForm<RecordFormValues>({
    resolver: zodResolver(recordFormSchema),
    defaultValues: createRecordFormDefaultValues(),
  });
}
