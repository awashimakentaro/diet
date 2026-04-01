/**
 * web/src/features/foods/api/create-meal-from-library-entry.ts
 *
 * 【責務】
 * Foods のライブラリエントリを meals テーブルへ「今日食べた」記録として保存する。
 *
 * 【使用されるエージェント / 処理フロー】
 * - use-foods-screen.ts から呼ばれる。
 * - foods エントリを meals の insert payload へ変換して保存する。
 *
 * 【やらないこと】
 * - UI 描画
 * - 食品一覧の取得
 * - 履歴一覧の再取得
 *
 * 【他ファイルとの関係】
 * - web-diet-schema.ts の WebLibraryEntry 型を受け取る。
 * - getSupabaseBrowserClient を利用する。
 * - prune-old-meals.ts を利用して保持期限外履歴を削除する。
 * - summary/api/recompute-daily-summary.ts を利用して日次集計を更新する。
 */

import type { WebLibraryEntry } from '@/domain/web-diet-schema';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { getTodayKey } from '@/lib/web-date';

import { pruneOldMealsForCurrentUser } from '../../history/prune-old-meals';
import { recomputeDailySummaryForDateKey } from '../../summary/api/recompute-daily-summary';

export async function createMealFromLibraryEntry(entry: WebLibraryEntry): Promise<void> {
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
    menu_name: entry.name,
    original_text: entry.description,
    source: 'library',
    foods: entry.items.map((item) => ({
      id: item.id,
      name: item.name,
      amount: item.amount,
      kcal: item.kcal,
      protein: item.protein,
      fat: item.fat,
      carbs: item.carbs,
    })),
    total: {
      kcal: entry.totals.kcal,
      protein: entry.totals.protein,
      fat: entry.totals.fat,
      carbs: entry.totals.carbs,
    },
  };
  const { error } = await client.from('meals').insert(payload);

  if (!error) {
    try {
      await recomputeDailySummaryForDateKey(getTodayKey());
    } catch {
      // Summary recompute failure should not block meal creation.
    }

    try {
      await pruneOldMealsForCurrentUser();
    } catch {
      // Retention cleanup failure should not block meal creation.
    }

    return;
  }

  const fallbackPayload = {
    user_id: userId,
    menu_name: entry.name,
    original_text: entry.description,
    foods: entry.items.map((item) => ({
      id: item.id,
      name: item.name,
      amount: item.amount,
      kcal: item.kcal,
      protein: item.protein,
      fat: item.fat,
      carbs: item.carbs,
    })),
    total: {
      kcal: entry.totals.kcal,
      protein: entry.totals.protein,
      fat: entry.totals.fat,
      carbs: entry.totals.carbs,
    },
  };
  const { error: fallbackError } = await client.from('meals').insert(fallbackPayload);

  if (fallbackError) {
    throw new Error(fallbackError.message);
  }

  try {
    await recomputeDailySummaryForDateKey(getTodayKey());
  } catch {
    // Summary recompute failure should not block meal creation.
  }

  try {
    await pruneOldMealsForCurrentUser();
  } catch {
    // Retention cleanup failure should not block meal creation.
  }
}
