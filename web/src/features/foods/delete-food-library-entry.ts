/**
 * web/src/features/foods/delete-food-library-entry.ts
 *
 * 【責務】
 * foods テーブルから指定エントリを削除する。
 *
 * 【使用されるエージェント / 処理フロー】
 * - use-foods-screen.ts から呼ばれる。
 * - 認証ユーザーと entryId で foods の delete を実行する。
 *
 * 【やらないこと】
 * - UI 描画
 * - 一覧再取得
 * - ルート遷移
 *
 * 【他ファイルとの関係】
 * - getSupabaseBrowserClient を利用する。
 */

import { getSupabaseBrowserClient } from '@/lib/supabase';

export async function deleteFoodLibraryEntry(entryId: string): Promise<void> {
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
    .from('foods')
    .delete()
    .eq('id', entryId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(error.message);
  }
}
