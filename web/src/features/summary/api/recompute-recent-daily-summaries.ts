/**
 * web/src/features/summary/api/recompute-recent-daily-summaries.ts
 *
 * 【責務】
 * 直近 N 日分の daily_summaries を順に再計算する。
 *
 * 【使用されるエージェント / 処理フロー】
 * - Home 画面の初回表示時に呼ばれる。
 * - 既存 meals から recent daily_summaries を遅延バックフィルする。
 *
 * 【やらないこと】
 * - UI 描画
 * - SWR 状態管理
 * - ルート遷移
 *
 * 【他ファイルとの関係】
 * - recompute-daily-summary.ts を日数分呼び出す。
 * - web-date.ts の formatDateKey を利用する。
 */

import { formatDateKey } from '@/lib/web-date';

import { recomputeDailySummaryForDateKey } from './recompute-daily-summary';

function buildDateKey(offset: number): string {
  const date = new Date();
  date.setDate(date.getDate() - offset);
  return formatDateKey(date);
}

export async function recomputeRecentDailySummaries(days: number): Promise<void> {
  for (let offset = 0; offset < days; offset += 1) {
    await recomputeDailySummaryForDateKey(buildDateKey(offset));
  }
}
