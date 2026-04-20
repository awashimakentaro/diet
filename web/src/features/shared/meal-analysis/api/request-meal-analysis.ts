/* 【責務】
 * 食事解析 API を HTTP 経由で呼び出す。
 */

import { fetchValidatedJson } from '@/lib/client-api';

import type { MealAnalysisRequest, MealAnalysisResponse } from '../schemas';
import { mealAnalysisResponseSchema } from '../schemas';

export async function requestMealAnalysis(
  payload: MealAnalysisRequest,
): Promise<MealAnalysisResponse> {
  return fetchValidatedJson(
    '/api/record/analyze',
    mealAnalysisResponseSchema,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    },
  );
}
