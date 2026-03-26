/**
 * web/src/features/record/record-form-schema.ts
 *
 * 【責務】
 * Record 画面で使う入力項目と下書き編集項目のフォームスキーマを Zod で定義する。
 *
 * 【使用箇所】
 * - web/src/features/record/use-record-form.ts
 * - web/src/features/record/use-record-screen.ts
 *
 * 【やらないこと】
 * - フォーム状態管理
 * - UI 描画
 * - API 通信
 *
 * 【他ファイルとの関係】
 * - RHF の resolver から利用され、入力検証境界になる。
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
  mealName: z.string().trim(),
  items: z.array(recordFoodItemSchema).min(1),
});

export type RecordFoodItemValues = z.infer<typeof recordFoodItemSchema>;
export type RecordFormValues = z.infer<typeof recordFormSchema>;
