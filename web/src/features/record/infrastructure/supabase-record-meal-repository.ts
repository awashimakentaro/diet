/* 【責務】
 * Record の食事を Supabase へ保存する。
 */

import { getSupabaseBrowserClient } from '@/lib/supabase';

import { pruneOldMealsForCurrentUser } from '../../history/api/prune-old-meals';
import { recomputeDailySummaryForDateKey } from '../../summary/api/recompute-daily-summary';
import type { RecordMealRepository } from '../repositories/record-meal-repository';
import { buildRecordSavePayload } from '../usecases/save/build-record-save-payload';

export const supabaseRecordMealRepository: RecordMealRepository = {
  async saveMeal({
    values,
    originalText,
    source,
  }) {
    const client = getSupabaseBrowserClient();
    const { data: userData, error: userError } = await client.auth.getUser();

    if (userError) {
      throw new Error(userError.message);
    }

    const userId = userData.user?.id;

    if (!userId) {
      throw new Error('ログイン状態を確認できません。');
    }

    const payload = buildRecordSavePayload({
      userId,
      values,
      originalText,
      source,
    });

    const { error } = await client.from('meals').insert(payload);

    if (error) {
      const fallbackPayload = {
        user_id: payload.user_id,
        original_text: payload.original_text,
        foods: payload.foods,
        total: payload.total,
        menu_name: payload.menu_name,
        timestamp: payload.timestamp,
      };
      const { error: fallbackError } = await client.from('meals').insert(fallbackPayload);

      if (fallbackError) {
        throw new Error(fallbackError.message);
      }
    }

    try {
      await recomputeDailySummaryForDateKey(values.recordedDate);
    } catch {
      // Summary recompute failure should not block meal save.
    }

    try {
      await pruneOldMealsForCurrentUser();
    } catch {
      // Retention cleanup failure should not block meal save.
    }
  },
};
