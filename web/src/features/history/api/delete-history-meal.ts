/**
 * web/src/features/history/api/delete-history-meal.ts
 *
 * 【責務】
 * History 画面から指定 Meal を Supabase 上で削除する。
 *
 * 【使用されるエージェント / 処理フロー】
 * - use-history-screen.ts から呼ばれる。
 * - 対象 meal id を Supabase へ渡して削除する。
 *
 * 【やらないこと】
 * - UI 描画
 * - 状態管理
 *
 * 【他ファイルとの関係】
 * - getSupabaseBrowserClient を利用する。
 */

import { getSupabaseBrowserClient } from '@/lib/supabase';

export async function deleteHistoryMeal(mealId: string): Promise<void> {
  const client = getSupabaseBrowserClient();
  const { error } = await client.from('meals').delete().eq('id', mealId);

  if (error) {
    throw new Error(error.message);
  }
}
