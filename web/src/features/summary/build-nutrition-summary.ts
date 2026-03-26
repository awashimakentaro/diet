/**
 * web/src/features/summary/build-nutrition-summary.ts
 *
 * 【責務】
 * daily_summaries の値を RecordSummaryCard 用 NutritionSummary に変換する。
 *
 * 【使用されるエージェント / 処理フロー】
 * - Home / History 画面から呼ばれる。
 * - 日次集計値と目標値をもとに表示用サマリーを組み立てる。
 *
 * 【やらないこと】
 * - API 通信
 * - UI 描画
 * - 永続化
 *
 * 【他ファイルとの関係】
 * - web-diet-schema.ts の WebDailySummary 型を受け取る。
 * - record-summary-card.tsx の NutritionSummary 型を返す。
 */

import { mockGoal } from '@/data/mock-diet-data';
import type { WebDailySummary } from '@/domain/web-diet-schema';
import type { NutritionSummary } from '@/features/record/components/record-summary-card';

function buildMacroSummary(
  label: string,
  current: number,
  target: number,
  tone: 'protein' | 'fat' | 'carbs',
): NutritionSummary['macros'][number] {
  const progress = target <= 0
    ? 0
    : Math.min(100, Math.max(0, Math.round((current / target) * 100)));

  return {
    label,
    current,
    target,
    remaining: current - target,
    tone,
    progress,
  };
}

export function buildNutritionSummary(
  dailySummary: WebDailySummary | null,
): NutritionSummary {
  const totals = dailySummary?.totals ?? {
    kcal: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
  };

  return {
    kcal: totals.kcal,
    goalKcal: mockGoal.totals.kcal,
    leftKcal: mockGoal.totals.kcal - totals.kcal,
    macros: [
      buildMacroSummary(
        'Protein (P)',
        totals.protein,
        mockGoal.totals.protein,
        'protein',
      ),
      buildMacroSummary(
        'Fat (F)',
        totals.fat,
        mockGoal.totals.fat,
        'fat',
      ),
      buildMacroSummary(
        'Carbs (C)',
        totals.carbs,
        mockGoal.totals.carbs,
        'carbs',
      ),
    ],
  };
}
