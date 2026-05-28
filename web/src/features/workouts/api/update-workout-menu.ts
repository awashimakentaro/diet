/* 【責務】
 * 保存済みワークアウトメニューを更新する。
 */

import { getSupabaseBrowserClient } from '@/lib/supabase';

import type { WorkoutExercise, WorkoutIntensity, WorkoutKind } from '../types';

type UpdateWorkoutMenuParams = {
  menuId: string;
  kind: WorkoutKind;
  name: string;
  durationMinutes: number;
  intensity: WorkoutIntensity;
  estimatedBurnedKcal: number;
  note: string;
  exercises: WorkoutExercise[];
};

export async function updateWorkoutMenu({
  menuId,
  kind,
  name,
  durationMinutes,
  intensity,
  estimatedBurnedKcal,
  note,
  exercises,
}: UpdateWorkoutMenuParams): Promise<void> {
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
    .from('workout_menus')
    .update({
      workout_kind: kind,
      name,
      exercise_name: exercises[0]?.exerciseName ?? name,
      sets: exercises[0]?.sets ?? 1,
      reps: exercises[0]?.reps ?? 1,
      weight_kg: exercises[0]?.weightKg ?? 0,
      exercises,
      duration_minutes: durationMinutes,
      intensity,
      estimated_burned_kcal: estimatedBurnedKcal,
      note: note.length > 0 ? note : null,
    })
    .eq('id', menuId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(error.message);
  }
}
