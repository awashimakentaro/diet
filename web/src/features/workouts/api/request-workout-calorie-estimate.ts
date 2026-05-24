/* 【責務】
 * 筋トレ消費カロリー推定 API を HTTP 経由で呼び出す。
 */

import { fetchValidatedJson } from '@/lib/client-api';
import { getSupabaseBrowserClient } from '@/lib/supabase';

import type { WorkoutCalorieEstimateRequest, WorkoutCalorieEstimateResponse } from '../schemas/workout-calorie-estimate-schema';
import { workoutCalorieEstimateResponseSchema } from '../schemas/workout-calorie-estimate-schema';

export async function requestWorkoutCalorieEstimate(
  payload: WorkoutCalorieEstimateRequest,
): Promise<WorkoutCalorieEstimateResponse> {
  const client = getSupabaseBrowserClient();
  const { data } = await client.auth.getSession();
  const accessToken = data.session?.access_token;

  return fetchValidatedJson(
    '/api/workouts/estimate',
    workoutCalorieEstimateResponseSchema,
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
