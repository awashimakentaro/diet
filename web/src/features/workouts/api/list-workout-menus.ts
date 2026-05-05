/* 【責務】
 * ログイン中ユーザーの筋トレメニュー一覧を取得する。
 */

import { getSupabaseBrowserClient } from '@/lib/supabase';

import { mapWorkoutMenuRow } from './map-workout-menu-row';

export async function listWorkoutMenus(): Promise<ReturnType<typeof mapWorkoutMenuRow>[]> {
  const client = getSupabaseBrowserClient();
  const { data: userData, error: userError } = await client.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  const userId = userData.user?.id;

  if (!userId) {
    return [];
  }

  const { data, error } = await client
    .from('workout_menus')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapWorkoutMenuRow);
}
