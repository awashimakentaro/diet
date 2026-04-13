/* 【責務】
 * meals テーブルの古い履歴を保持期間ルールに従って削除する。
 */

import { getSupabaseBrowserClient } from '@/lib/supabase';

const MIN_RETENTION_DAYS = 14;
const MAX_RETENTION_DAYS = 30;
const DEFAULT_RETENTION_DAYS = 30;

function resolveMealsRetentionDays(): number {
  const raw = process.env.NEXT_PUBLIC_MEALS_RETENTION_DAYS;
  const parsed = Number.parseInt(raw ?? '', 10);

  if (Number.isNaN(parsed)) {
    return DEFAULT_RETENTION_DAYS;
  }

  if (parsed < MIN_RETENTION_DAYS) {
    return MIN_RETENTION_DAYS;
  }

  if (parsed > MAX_RETENTION_DAYS) {
    return MAX_RETENTION_DAYS;
  }

  return parsed;
}

function buildCutoffIso(retentionDays: number): string {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - retentionDays);
  return cutoff.toISOString();
}

export function getMealsRetentionDays(): number {
  return resolveMealsRetentionDays();
}

export async function pruneOldMealsForCurrentUser(): Promise<void> {
  const client = getSupabaseBrowserClient();
  const { data: userData, error: userError } = await client.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  const userId = userData.user?.id;

  if (!userId) {
    return;
  }

  const retentionDays = resolveMealsRetentionDays();
  const cutoffIso = buildCutoffIso(retentionDays);
  const { error } = await client
    .from('meals')
    .delete()
    .eq('user_id', userId)
    .lt('timestamp', cutoffIso);

  if (error) {
    throw new Error(error.message);
  }
}
