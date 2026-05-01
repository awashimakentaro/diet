/* 【責務】
 * Foods 画面から食品ライブラリの履歴追加処理を呼び出す。
 */

import type { WebLibraryEntry } from '@/domain/web-diet-schema';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { getTodayKey } from '@/lib/web-date';

import { pruneOldMealsForCurrentUser } from '../../history/api/prune-old-meals';
import { recomputeDailySummaryForDateKey } from '../../summary/api/recompute-daily-summary';
import { createMealFromLibraryEntryRecord } from '../server/create-meal-from-library-entry-record';

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

  await createMealFromLibraryEntryRecord({ client, userId, entry });

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
