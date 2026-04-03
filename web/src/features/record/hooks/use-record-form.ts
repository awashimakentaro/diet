/* 【責務】
 * Record 画面向けの React Hook Form 設定と初期下書きを提供する。
 */

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { formatDateKey } from '@/lib/web-date';

import { recordFormSchema, type RecordFormValues } from '../schemas/record-form-schema';

function createDefaultFoodItem() {
  return {
    name: '',
    amount: '1人前',
    kcal: '0',
    protein: '0',
    fat: '0',
    carbs: '0',
  };
}

export function useRecordForm(): UseFormReturn<RecordFormValues> {
  return useForm<RecordFormValues>({
    resolver: zodResolver(recordFormSchema),
    defaultValues: {
      prompt: '',
      recordedDate: formatDateKey(new Date()),
      mealName: '',
      items: [createDefaultFoodItem()],
    },
  });
}
