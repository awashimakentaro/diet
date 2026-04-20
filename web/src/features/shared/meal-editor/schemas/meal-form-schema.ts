/* 【責務】
 * 食事編集で共通利用するフォームスキーマを定義する。
 */

import { z } from 'zod';

export const mealFoodItemSchema = z.object({
  name: z.string().trim(),
  amount: z.string().trim(),
  kcal: z.string().trim(),
  protein: z.string().trim(),
  fat: z.string().trim(),
  carbs: z.string().trim(),
});

export const mealFormSchema = z.object({
  prompt: z.string().trim(),
  recordedDate: z.string().trim().min(1),
  mealName: z.string().trim(),
  items: z.array(mealFoodItemSchema).min(1),
});

export type MealFoodItemValues = z.infer<typeof mealFoodItemSchema>;
export type MealFormValues = z.infer<typeof mealFormSchema>;
