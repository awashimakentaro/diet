/* 【責務】
 * ワークアウト実施記録を保存済みメニューとして複製する。
 */

import { getSupabaseBrowserClient } from '@/lib/supabase';

import type { WorkoutLog } from '../types';

export async function saveWorkoutLogAsMenu(log: WorkoutLog): Promise<void> {
  const client = getSupabaseBrowserClient();
  const { data: userData, error: userError } = await client.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  const userId = userData.user?.id;

  if (!userId) {
    throw new Error('ログイン状態を確認できません。');
  }

  const firstExercise = log.exercises[0];
  const { error } = await client.from('workout_menus').insert({
    user_id: userId,
    workout_kind: log.kind,
    name: log.name,
    exercise_name: firstExercise?.exerciseName ?? log.name,
    sets: firstExercise?.sets ?? 1,
    reps: firstExercise?.reps ?? 1,
    weight_kg: firstExercise?.weightKg ?? 0,
    exercises: log.exercises,
    duration_minutes: log.durationMinutes,
    intensity: log.intensity,
    estimated_burned_kcal: log.burnedKcal,
    note: log.note.length > 0 ? log.note : null,
  });

  if (error) {
    throw new Error(error.message);
  }
}
