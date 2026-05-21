/* 【責務】
 * ワークアウト実施記録を更新する。
 */

import { getSupabaseBrowserClient } from '@/lib/supabase';

import type { WorkoutIntensity, WorkoutKind } from '../types';

type UpdateWorkoutLogParams = {
  logId: string;
  kind: WorkoutKind;
  name: string;
  durationMinutes: number;
  intensity: WorkoutIntensity;
  burnedKcal: number;
  note: string;
};

export async function updateWorkoutLog({
  logId,
  kind,
  name,
  durationMinutes,
  intensity,
  burnedKcal,
  note,
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
      exercise_name: name,
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
