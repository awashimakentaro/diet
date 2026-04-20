/* 【責務】
 * 食事解析で共通利用する入出力スキーマを定義する。
 */

import { z } from 'zod';

export const mealAnalysisRequestSchema = z
  .object({
    prompt: z.string().trim(),
    images: z.array(z.string()).optional(),
  })
  .refine(
    (value) => value.prompt.length > 0 || (value.images?.length ?? 0) > 0,
    {
      message: 'prompt または images のどちらかが必要です。',
    },
  );

export const mealAnalysisItemSchema = z.object({
  name: z.string().trim().min(1),
  amount: z.string().trim().min(1),
  kcal: z.number().min(0),
  protein: z.number().min(0),
  fat: z.number().min(0),
  carbs: z.number().min(0),
});

export const mealAnalysisResponseSchema = z.object({
  menuName: z.string().trim().min(1),
  originalText: z.string().trim(),
  items: z.array(mealAnalysisItemSchema).min(1),
  warnings: z.array(z.string()),
  source: z.enum(['text', 'vision', 'fallback']),
});

export type MealAnalysisRequest = z.infer<typeof mealAnalysisRequestSchema>;
export type MealAnalysisResponse = z.infer<typeof mealAnalysisResponseSchema>;
