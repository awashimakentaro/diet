/* 【責務】
 * 保存済みワークアウトメニューを更新する。
 */

import { getSupabaseBrowserClient } from '@/lib/supabase';

import type { WorkoutIntensity, WorkoutKind } from '../types';

type UpdateWorkoutMenuParams = {
  menuId: string;
  kind: WorkoutKind;
  name: string;
  durationMinutes: number;
  intensity: WorkoutIntensity;
  estimatedBurnedKcal: number;
  note: string;
};

export async function updateWorkoutMenu({
  menuId,
  kind,
  name,
  durationMinutes,
  intensity,
  estimatedBurnedKcal,
  note,
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
      exercise_name: name,
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
