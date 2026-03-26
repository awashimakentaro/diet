/**
 * web/src/features/history/save-history-meal-to-foods.ts
 *
 * 【責務】
 * History の Meal を foods テーブルへ再利用用エントリとして保存する。
 *
 * 【使用されるエージェント / 処理フロー】
 * - use-history-screen.ts から呼ばれる。
 * - meal の totals/items を foods の insert payload へ変換して永続化する。
 *
 * 【やらないこと】
 * - UI 描画
 * - 履歴一覧の再取得
 * - foods 一覧の表示整形
 *
 * 【他ファイルとの関係】
 * - web-diet-schema.ts の WebMeal を受け取る。
 * - getSupabaseBrowserClient を利用する。
 */

import type { WebMeal } from '@/domain/web-diet-schema';
import { getSupabaseBrowserClient } from '@/lib/supabase';

export async function saveHistoryMealToFoods(meal: WebMeal): Promise<void> {
  const client = getSupabaseBrowserClient();
  const { data: userData, error: userError } = await client.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  const userId = userData.user?.id;

  if (!userId) {
    throw new Error('ログイン状態を確認できません。');
  }

  const payload = {
    user_id: userId,
    name: meal.menuName,
    amount: '1人前',
    calories: meal.totals.kcal,
    protein: meal.totals.protein,
    fat: meal.totals.fat,
    carbs: meal.totals.carbs,
    items: meal.items,
  };
  const { error } = await client.from('foods').insert(payload);

  if (error) {
    throw new Error(error.message);
  }
}
