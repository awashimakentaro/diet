/* 【責務】
 * 筋トレ以外の単発ワークアウトを今日の実施記録として保存する。
 */

import { getSupabaseBrowserClient } from '@/lib/supabase';

type CreateOtherWorkoutLogParams = {
  name: string;
  durationMinutes: number;
  burnedKcal: number;
  note: string;
};

export async function createOtherWorkoutLog({
  name,
  durationMinutes,
  burnedKcal,
  note,
}: CreateOtherWorkoutLogParams): Promise<void> {
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
    workout_kind: 'other',
    menu_id: null,
    menu_name: name,
    exercise_name: name,
    sets: 1,
    reps: 1,
    weight_kg: 0,
    exercises: [
      {
        exerciseName: name,
        sets: 1,
        reps: 1,
        weightKg: 0,
        durationMinutes,
      },
    ],
    duration_minutes: durationMinutes,
    intensity: 'normal',
    burned_kcal: burnedKcal,
    note: note.length > 0 ? note : null,
  });

  if (error) {
    throw new Error(error.message);
  }
}
