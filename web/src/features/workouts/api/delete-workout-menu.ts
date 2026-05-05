/* 【責務】
 * ログイン中ユーザーの筋トレメニューを削除する。
 */

import { getSupabaseBrowserClient } from '@/lib/supabase';

export async function deleteWorkoutMenu(menuId: string): Promise<void> {
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
    .delete()
    .eq('id', menuId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(error.message);
  }
}
