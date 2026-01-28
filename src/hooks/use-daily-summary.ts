/**
 * hooks/use-daily-summary.ts
 *
 * 【責務】
 * SummaryAgent を React コンポーネントから購読し、指定日のサマリーを返すカスタムフックを提供する。
 *
 * 【使用箇所】
 * - RecordScreen
 * - HistoryScreen のサブヘッダー
 * - SettingsScreen
 *
 * 【やらないこと】
 * - サマリー計算ロジックの再実装
 *
 * 【他ファイルとの関係】
 * - agents/summary-agent.ts の API をそのまま利用する。
 */

import { useEffect, useState } from 'react';

import { DailySummary, getDailySummary, subscribeSummary } from '@/agents/summary-agent';

/**
 * 指定日サマリーを購読する。
 * 呼び出し元: 各スクリーン。
 * @param dateKey `YYYY-MM-DD`
 * @returns DailySummary
 */
export function useDailySummary(dateKey: string): DailySummary {
  const [summary, setSummary] = useState<DailySummary>(() => getDailySummary(dateKey));

  useEffect(() => {
    setSummary(getDailySummary(dateKey));
    const unsubscribe = subscribeSummary(() => {
      setSummary(getDailySummary(dateKey));
    });
    return () => unsubscribe();
  }, [dateKey]);

  return summary;
}
