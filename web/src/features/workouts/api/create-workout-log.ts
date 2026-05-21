/* 【責務】
 * 入力済み筋トレメニューを今日の実施記録として保存する。
 */

import { getSupabaseBrowserClient } from '@/lib/supabase';

import type { WorkoutExercise, WorkoutIntensity } from '../types';

type CreateWorkoutLogParams = {
  name: string;
  exercises: WorkoutExercise[];
  durationMinutes: number;
  intensity: WorkoutIntensity;
  burnedKcal: number;
  note: string;
};

export async function createWorkoutLog({
  name,
  exercises,
  durationMinutes,
  intensity,
  burnedKcal,
  note,
}: CreateWorkoutLogParams): Promise<void> {
  const client = getSupabaseBrowserClient();
  const { data: userData, error: userError } = await client.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  const userId = userData.user?.id;

  if (!userId) {
    throw new Error('ログイン状態を確認できません。');
  }

  const { error } = await client.from('workout_logs').insert({
    user_id: userId,
    workout_kind: 'strength',
    menu_id: null,
    menu_name: name,
    exercise_name: exercises[0]?.exerciseName ?? '',
    sets: exercises[0]?.sets ?? 1,
    reps: exercises[0]?.reps ?? 1,
    weight_kg: exercises[0]?.weightKg ?? 0,
    exercises,
    duration_minutes: durationMinutes,
    intensity,
    burned_kcal: burnedKcal,
    note: note.length > 0 ? note : null,
  });

  if (error) {
    throw new Error(error.message);
  }
}
