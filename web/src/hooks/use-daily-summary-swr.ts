/**
 * web/src/hooks/use-daily-summary-swr.ts
 *
 * 【責務】
 * 当日サマリー取得の SWR フックを提供する。
 *
 * 【使用箇所】
 * - 今後の Record / History 画面
 *
 * 【やらないこと】
 * - UI 描画
 * - DB 直接アクセス
 * - 書き込み処理
 *
 * 【他ファイルとの関係】
 * - client-api.ts の Zod 検証付き fetch を利用する。
 */

import useSWR, { type SWRResponse } from 'swr';
import { z } from 'zod';

import { fetchValidatedJson } from '@/lib/client-api';

export const dailySummarySchema = z.object({
  kcal: z.number(),
  protein: z.number(),
  fat: z.number(),
  carbs: z.number(),
});

export type DailySummaryPayload = z.infer<typeof dailySummarySchema>;

/**
 * 当日サマリー取得用の SWR フックを返す。
 * 呼び出し元: Web のサマリー表示 UI。
 * @param endpoint 取得先 API パス
 * @returns SWR の状態オブジェクト
 * @remarks 副作用: ネットワーク I/O を発生させる可能性がある。
 */
export function useDailySummarySWR(
  endpoint = '/api/summary/today',
): SWRResponse<DailySummaryPayload> {
  return useSWR(endpoint, (url) => fetchValidatedJson(url, dailySummarySchema));
}
