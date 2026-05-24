/* 【責務】
 * 食事解析 API を HTTP 経由で呼び出す。
 */

import { fetchValidatedJson } from '@/lib/client-api';
import { getSupabaseBrowserClient } from '@/lib/supabase';

import type { MealAnalysisRequest, MealAnalysisResponse } from '../schemas';
import { mealAnalysisResponseSchema } from '../schemas';

export async function requestMealAnalysis(
  payload: MealAnalysisRequest,
): Promise<MealAnalysisResponse> {
  const client = getSupabaseBrowserClient();
  const { data } = await client.auth.getSession();
  const accessToken = data.session?.access_token;

  return fetchValidatedJson(
    '/api/record/analyze',
    mealAnalysisResponseSchema,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify(payload),
    },
  );
}
