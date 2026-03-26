/**
 * web/src/features/record/use-record-form.ts
 *
 * 【責務】
 * Record 画面向けの React Hook Form 設定と初期下書きを提供する。
 *
 * 【使用箇所】
 * - web/src/features/record/use-record-screen.ts
 *
 * 【やらないこと】
 * - UI 描画
 * - API 実行
 * - 永続化
 *
 * 【他ファイルとの関係】
 * - record-form-schema.ts と @hookform/resolvers/zod を利用して検証付きフォームを構成する。
 */

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type UseFormReturn } from 'react-hook-form';

import { recordFormSchema, type RecordFormValues } from './record-form-schema';

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

/**
 * Record 画面のフォーム設定を返す。
 * 呼び出し元: Record 画面のフォーム UI。
 * @returns React Hook Form のコントローラ
 * @remarks 副作用は存在しない。
 */
export function useRecordForm(): UseFormReturn<RecordFormValues> {
  return useForm<RecordFormValues>({
    resolver: zodResolver(recordFormSchema),
    defaultValues: {
      prompt: '',
      mealName: '',
      items: [createDefaultFoodItem()],
    },
  });
}
