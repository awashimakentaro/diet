/* 【責務】
 * 保存済み筋トレメニューを今日の実施記録として保存する。
 */

import { getSupabaseBrowserClient } from '@/lib/supabase';
import { getUserProfile } from '@/features/settings/api/get-user-profile';

import type { WorkoutMenu } from '../types';
import { calculateWorkoutBurnedKcal } from '../utils/calculate-workout-burned-kcal';

export async function logWorkoutMenu(menu: WorkoutMenu): Promise<void> {
  const client = getSupabaseBrowserClient();
  const { data: userData, error: userError } = await client.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  const userId = userData.user?.id;

  if (!userId) {
    throw new Error('ログイン状態を確認できません。');
  }

  let savedBurnedKcal = menu.estimatedBurnedKcal;

  if (savedBurnedKcal === null) {
    const profile = await getUserProfile();
    const currentWeightKg = Number(profile?.current_weight_kg);

    if (!Number.isFinite(currentWeightKg) || currentWeightKg <= 0) {
      throw new Error('プロフィールに現在の体重を保存してください。');
    }

    savedBurnedKcal = calculateWorkoutBurnedKcal({
      intensity: menu.intensity,
      weightKg: currentWeightKg,
      durationMinutes: menu.durationMinutes,
    });
  }

  const { error } = await client.from('workout_logs').insert({
    user_id: userId,
    workout_kind: menu.kind,
    menu_id: menu.id,
    menu_name: menu.name,
    exercise_name: menu.exercises[0]?.exerciseName ?? '',
    sets: menu.exercises[0]?.sets ?? 1,
    reps: menu.exercises[0]?.reps ?? 1,
    weight_kg: menu.exercises[0]?.weightKg ?? 0,
    exercises: menu.exercises,
    duration_minutes: menu.durationMinutes,
    intensity: menu.intensity,
    burned_kcal: savedBurnedKcal,
    note: menu.note.length > 0 ? menu.note : null,
  });

  if (error) {
    throw new Error(error.message);
  }
}
