/* 【責務】
 * ワークアウト実施記録を更新する。
 */

import { getSupabaseBrowserClient } from '@/lib/supabase';

import type { WorkoutExercise, WorkoutIntensity, WorkoutKind } from '../types';

type UpdateWorkoutLogParams = {
  logId: string;
  kind: WorkoutKind;
  name: string;
  durationMinutes: number;
  intensity: WorkoutIntensity;
  burnedKcal: number;
  note: string;
  exercises: WorkoutExercise[];
};

export async function updateWorkoutLog({
  logId,
  kind,
  name,
  durationMinutes,
  intensity,
  burnedKcal,
  note,
  exercises,
}: UpdateWorkoutLogParams): Promise<void> {
  const client = getSupabaseBrowserClient();
  const { data: userData, error: userError } = await client.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  const userId = userData.user?.id;

  if (!userId) {
    throw new Error('ログイン状態を確認できません。');
  }

  const { error } = await client
    .from('workout_logs')
    .update({
      workout_kind: kind,
      menu_name: name,
      exercise_name: exercises[0]?.exerciseName ?? name,
      sets: exercises[0]?.sets ?? 1,
      reps: exercises[0]?.reps ?? 1,
      weight_kg: exercises[0]?.weightKg ?? 0,
      exercises,
      duration_minutes: durationMinutes,
      intensity,
      burned_kcal: burnedKcal,
      note: note.length > 0 ? note : null,
    })
    .eq('id', logId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(error.message);
  }
}
