/**
 * web/src/features/summary/api/list-recent-daily-summaries.ts
 *
 * 【責務】
 * 直近 N 日分の daily_summaries を取得する。
 *
 * 【使用されるエージェント / 処理フロー】
 * - Home 画面から呼ばれる。
 * - user_id と date 範囲で daily_summaries を問い合わせる。
 *
 * 【やらないこと】
 * - UI 描画
 * - グラフ描画
 *
 * 【他ファイルとの関係】
 * - getSupabaseBrowserClient、map-web-daily-summary-row.ts を利用する。
 */

import type { WebDailySummary } from '@/domain/web-diet-schema';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { formatDateKey } from '@/lib/web-date';

import { isDailySummarySchemaMissing } from '../is-daily-summary-schema-missing';
import { mapWebDailySummaryRow } from '../map-web-daily-summary-row';

function buildStartDateKey(days: number): string {
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  return formatDateKey(start);
}

export async function listRecentDailySummaries(days: number): Promise<WebDailySummary[]> {
  const client = getSupabaseBrowserClient();
  const { data: userData, error: userError } = await client.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  const userId = userData.user?.id;

  if (!userId) {
    return [];
  }

  const startDateKey = buildStartDateKey(days);
  const endDateKey = formatDateKey(new Date());
  const { data, error } = await client
    .from('daily_summaries')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDateKey)
    .lte('date', endDateKey)
    .order('date', { ascending: true });

  if (error) {
    if (isDailySummarySchemaMissing(error.message)) {
      return [];
    }

    throw new Error(error.message);
  }

  return (data ?? []).map(mapWebDailySummaryRow);
}
