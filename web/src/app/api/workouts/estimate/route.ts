/* 【責務】
 * 筋トレメニューの消費カロリー推定リクエストを処理する。
 */

import { NextResponse } from 'next/server';

import { workoutCalorieEstimateRequestSchema } from '@/features/workouts/schemas/workout-calorie-estimate-schema';
import { estimateWorkoutCalories } from '@/lib/openai-workout-calorie-estimate';

export async function POST(request: Request): Promise<Response> {
  try {
    const payload = await request.json();
    const parsed = workoutCalorieEstimateRequestSchema.parse(payload);
    const estimate = await estimateWorkoutCalories(parsed);

    return NextResponse.json(estimate);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : '筋トレ消費カロリー推定に失敗しました。';

    return NextResponse.json(
      { message },
      { status: 400 },
    );
  }
}
