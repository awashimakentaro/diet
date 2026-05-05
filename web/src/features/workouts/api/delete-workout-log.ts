/* 【責務】
 * ログイン中ユーザーの筋トレ実施記録を削除する。
 */

import { getSupabaseBrowserClient } from '@/lib/supabase';

export async function deleteWorkoutLog(logId: string): Promise<void> {
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
    .delete()
    .eq('id', logId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(error.message);
  }
}
