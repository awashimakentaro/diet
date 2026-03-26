/**
 * web/src/features/summary/map-web-daily-summary-row.ts
 *
 * 【責務】
 * Supabase の daily_summaries 行を WebDailySummary 型へ変換する。
 *
 * 【使用されるエージェント / 処理フロー】
 * - list-daily-summary.ts と list-recent-daily-summaries.ts から呼ばれる。
 * - DB 応答を Web 表示用の型へ正規化する。
 *
 * 【やらないこと】
 * - API 通信
 * - UI 描画
 * - 永続化
 *
 * 【他ファイルとの関係】
 * - web-diet-schema.ts の WebDailySummary 型に依存する。
 */

import type { WebDailySummary } from '@/domain/web-diet-schema';

type DailySummaryRow = {
  date: string;
  kcal: number | string;
  protein: number | string;
  fat: number | string;
  carbs: number | string;
  meal_count: number | string;
  top_foods: Array<{
    name?: string;
    count?: number | string;
  }> | null;
  updated_at: string;
};

function toNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.round(parsed * 10) / 10 : 0;
}

export function mapWebDailySummaryRow(row: DailySummaryRow): WebDailySummary {
  return {
    date: row.date,
    totals: {
      kcal: toNumber(row.kcal),
      protein: toNumber(row.protein),
      fat: toNumber(row.fat),
      carbs: toNumber(row.carbs),
    },
    mealCount: toNumber(row.meal_count),
    topFoods: (row.top_foods ?? []).map((item) => ({
      name: item.name ?? '名称未設定',
      count: toNumber(item.count),
    })),
    updatedAt: row.updated_at,
  };
}
