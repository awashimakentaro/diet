/* 【責務】
 * Record 画面で使う入力項目と下書き編集項目のフォームスキーマを定義する。
 */

import { z } from 'zod';

export const recordFoodItemSchema = z.object({
  name: z.string().trim(),
  amount: z.string().trim(),
  kcal: z.string().trim(),
  protein: z.string().trim(),
  fat: z.string().trim(),
  carbs: z.string().trim(),
});

export const recordFormSchema = z.object({
  prompt: z.string().trim(),
  recordedDate: z.string().trim().min(1),
  mealName: z.string().trim(),
  items: z.array(recordFoodItemSchema).min(1),
});

export type RecordFoodItemValues = z.infer<typeof recordFoodItemSchema>;
export type RecordFormValues = z.infer<typeof recordFormSchema>;
