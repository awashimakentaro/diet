/**
 * web/src/features/summary/api/list-week-daily-summaries.ts
 *
 * 【責務】
 * 指定した週の daily_summaries を取得する。
 *
 * 【使用されるエージェント / 処理フロー】
 * - Home 画面から呼ばれる。
 * - user_id と週範囲で daily_summaries を問い合わせる。
 *
 * 【やらないこと】
 * - UI 描画
 * - 永続化
 * - 集計更新
 *
 * 【他ファイルとの関係】
 * - getSupabaseBrowserClient、map-web-daily-summary-row.ts を利用する。
 */

import type { WebDailySummary } from '@/domain/web-diet-schema';
import { getSupabaseBrowserClient } from '@/lib/supabase';

import { isDailySummarySchemaMissing } from '../is-daily-summary-schema-missing';
import { mapWebDailySummaryRow } from '../map-web-daily-summary-row';

type ListWeekDailySummariesParams = {
  startDateKey: string;
  endDateKey: string;
};

export async function listWeekDailySummaries({
  startDateKey,
  endDateKey,
}: ListWeekDailySummariesParams): Promise<WebDailySummary[]> {
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
