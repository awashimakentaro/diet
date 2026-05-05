/* 【責務】
 * ログイン中ユーザーの筋トレメニューを作成する。
 */

import { getSupabaseBrowserClient } from '@/lib/supabase';

import type { WorkoutExercise, WorkoutIntensity } from '../types';

type CreateWorkoutMenuParams = {
  name: string;
  exercises: WorkoutExercise[];
  durationMinutes: number;
  intensity: WorkoutIntensity;
  estimatedBurnedKcal: number;
  note: string;
};

export async function createWorkoutMenu({
  name,
  exercises,
  durationMinutes,
  intensity,
  estimatedBurnedKcal,
  note,
}: CreateWorkoutMenuParams): Promise<void> {
  const client = getSupabaseBrowserClient();
  const { data: userData, error: userError } = await client.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  const userId = userData.user?.id;

  if (!userId) {
    throw new Error('ログイン状態を確認できません。');
  }

  const { error } = await client.from('workout_menus').insert({
    user_id: userId,
    workout_kind: 'strength',
    name,
    exercise_name: exercises[0]?.exerciseName ?? '',
    sets: exercises[0]?.sets ?? 1,
    reps: exercises[0]?.reps ?? 1,
    weight_kg: exercises[0]?.weightKg ?? 0,
    exercises,
    duration_minutes: durationMinutes,
    intensity,
    estimated_burned_kcal: estimatedBurnedKcal,
    note: note.length > 0 ? note : null,
  });

  if (error) {
    throw new Error(error.message);
  }
}
