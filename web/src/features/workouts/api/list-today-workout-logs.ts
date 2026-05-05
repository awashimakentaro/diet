/* 【責務】
 * ログイン中ユーザーの今日の筋トレ実施記録を取得する。
 */

import { getUtcRangeForDateKey } from '@/lib/web-date';
import { getSupabaseBrowserClient } from '@/lib/supabase';

import { mapWorkoutLogRow } from './map-workout-log-row';

export async function listTodayWorkoutLogs(dateKey: string): Promise<ReturnType<typeof mapWorkoutLogRow>[]> {
  const client = getSupabaseBrowserClient();
  const { data: userData, error: userError } = await client.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  const userId = userData.user?.id;

  if (!userId) {
    return [];
  }

  const range = getUtcRangeForDateKey(dateKey);
  const { data, error } = await client
    .from('workout_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('performed_at', range.start)
    .lt('performed_at', range.end)
    .order('performed_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapWorkoutLogRow);
}
