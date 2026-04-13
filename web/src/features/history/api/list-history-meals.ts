/* 【責務】
 * History 画面向けに指定日付の meals を Supabase から取得する。
 */

import type { WebMeal } from '@/domain/web-diet-schema';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { getUtcRangeForDateKey } from '@/lib/web-date';

import { mapWebMealRow } from '../utils/map-web-meal-row';
import { pruneOldMealsForCurrentUser } from './prune-old-meals';

export async function listHistoryMeals(dateKey: string): Promise<WebMeal[]> {
  try {
    await pruneOldMealsForCurrentUser();
  } catch {
    // Retention cleanup failure should not block history listing.
  }

  const client = getSupabaseBrowserClient();
  const { data: userData, error: userError } = await client.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  const userId = userData.user?.id;

  if (!userId) {
    return [];
  }

  const { start, end } = getUtcRangeForDateKey(dateKey);
  const { data, error } = await client
    .from('meals')
    .select('*')
    .eq('user_id', userId)
    .gte('timestamp', start)
    .lt('timestamp', end)
    .order('timestamp', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapWebMealRow);
}
