/* 【責務】
 * 筋トレ消費カロリー推定 API を HTTP 経由で呼び出す。
 */

import { fetchValidatedJson } from '@/lib/client-api';

import type { WorkoutCalorieEstimateRequest, WorkoutCalorieEstimateResponse } from '../schemas/workout-calorie-estimate-schema';
import { workoutCalorieEstimateResponseSchema } from '../schemas/workout-calorie-estimate-schema';

export async function requestWorkoutCalorieEstimate(
  payload: WorkoutCalorieEstimateRequest,
): Promise<WorkoutCalorieEstimateResponse> {
  return fetchValidatedJson(
    '/api/workouts/estimate',
    workoutCalorieEstimateResponseSchema,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    },
  );
}
