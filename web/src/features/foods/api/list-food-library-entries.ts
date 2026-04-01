/**
 * web/src/features/foods/api/list-food-library-entries.ts
 *
 * 【責務】
 * foods テーブルから食品ライブラリエントリを取得する。
 *
 * 【使用されるエージェント / 処理フロー】
 * - use-foods-screen.ts から呼ばれる。
 * - 認証ユーザーに紐づく foods を created_at 降順で取得する。
 *
 * 【やらないこと】
 * - UI 描画
 * - 検索条件の整形
 *
 * 【他ファイルとの関係】
 * - getSupabaseBrowserClient と map-web-food-row.ts を利用する。
 */

import { getSupabaseBrowserClient } from '@/lib/supabase';

import { mapWebFoodRow } from '../map-web-food-row';

export async function listFoodLibraryEntries(): Promise<
Array<ReturnType<typeof mapWebFoodRow>>
> {
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
    .from('foods')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapWebFoodRow);
}
