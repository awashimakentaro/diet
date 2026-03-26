/**
 * web/src/features/summary/list-daily-summary.ts
 *
 * 【責務】
 * 指定日付の daily_summaries を1件取得する。
 *
 * 【使用されるエージェント / 処理フロー】
 * - Home/History 画面から呼ばれる。
 * - user_id と date で daily_summaries を問い合わせる。
 *
 * 【やらないこと】
 * - UI 描画
 * - SWR 状態管理
 * - 日次集計の再計算
 *
 * 【他ファイルとの関係】
 * - getSupabaseBrowserClient、map-web-daily-summary-row.ts を利用する。
 */

import type { WebDailySummary } from '@/domain/web-diet-schema';
import { getSupabaseBrowserClient } from '@/lib/supabase';

import { isDailySummarySchemaMissing } from './is-daily-summary-schema-missing';
import { mapWebDailySummaryRow } from './map-web-daily-summary-row';

export async function listDailySummary(dateKey: string): Promise<WebDailySummary | null> {
  const client = getSupabaseBrowserClient();
  const { data: userData, error: userError } = await client.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  const userId = userData.user?.id;

  if (!userId) {
    return null;
  }

  const { data, error } = await client
    .from('daily_summaries')
    .select('*')
    .eq('user_id', userId)
    .eq('date', dateKey)
    .maybeSingle();

  if (error) {
    if (isDailySummarySchemaMissing(error.message)) {
      return null;
    }

    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return mapWebDailySummaryRow(data);
}
