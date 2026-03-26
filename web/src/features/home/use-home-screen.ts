'use client';

/**
 * web/src/features/home/use-home-screen.ts
 *
 * 【責務】
 * Home 画面に表示するモックベースのサマリーと分析データを組み立てる。
 *
 * 【使用されるエージェント / 処理フロー】
 * - home-screen.tsx から呼ばれる。
 * - mock-diet-data.ts の固定データを Home UI 向けに整形する。
 *
 * 【やらないこと】
 * - API 通信
 * - 永続化
 * - JSX 描画
 *
 * 【他ファイルとの関係】
 * - web/src/data/mock-diet-data.ts を利用する。
 * - record-summary-card.tsx へ渡す NutritionSummary を返す。
 */

import { mockGoal, mockMeals, mockTodayTotals } from '@/data/mock-diet-data';
import type { NutritionSummary } from '@/features/record/components/record-summary-card';

type HomeInsight = {
  label: string;
  value: string;
  description: string;
};

type HomeUsageBar = {
  label: string;
  value: number;
};

type HomeRecentMeal = {
  id: string;
  name: string;
  time: string;
  kcal: number;
};

export type UseHomeScreenResult = {
  summary: NutritionSummary;
  consecutiveDays: number;
  insights: HomeInsight[];
  usageBars: HomeUsageBar[];
  recentMeals: HomeRecentMeal[];
};

function buildMacroSummary(
  label: string,
  current: number,
  target: number,
  tone: 'protein' | 'fat' | 'carbs',
) {
  const progress = Math.min(100, Math.max(0, Math.round((current / target) * 100)));

  return {
    label,
    current,
    target,
    remaining: current - target,
    tone,
    progress,
  };
}

function formatMealTime(value: string): string {
  return new Intl.DateTimeFormat('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function useHomeScreen(): UseHomeScreenResult {
  const summary: NutritionSummary = {
    kcal: mockTodayTotals.kcal,
    goalKcal: mockGoal.totals.kcal,
    leftKcal: mockGoal.totals.kcal - mockTodayTotals.kcal,
    macros: [
      buildMacroSummary(
        'Protein (P)',
        mockTodayTotals.protein,
        mockGoal.totals.protein,
        'protein',
      ),
      buildMacroSummary(
        'Fat (F)',
        mockTodayTotals.fat,
        mockGoal.totals.fat,
        'fat',
      ),
      buildMacroSummary(
        'Carbs (C)',
        mockTodayTotals.carbs,
        mockGoal.totals.carbs,
        'carbs',
      ),
    ],
  };

  const highestProteinMeal = [...mockMeals].sort(
    (left, right) => right.totals.protein - left.totals.protein,
  )[0];

  return {
    summary,
    consecutiveDays: 6,
    insights: [
      {
        label: '平均摂取カロリー',
        value: '1,742 kcal',
        description: '直近 7 日の平均。目標との差は -358 kcal です。',
      },
      {
        label: '高たんぱくメニュー',
        value: highestProteinMeal.menuName,
        description: `${highestProteinMeal.totals.protein}g のたんぱく質を記録しています。`,
      },
      {
        label: '今週の傾向',
        value: '夜の脂質が高め',
        description: '夕食の脂質比率が高いので、次回は主食量の見直し余地があります。',
      },
    ],
    usageBars: [
      { label: 'Mon', value: 72 },
      { label: 'Tue', value: 86 },
      { label: 'Wed', value: 68 },
      { label: 'Thu', value: 91 },
      { label: 'Fri', value: 84 },
      { label: 'Sat', value: 76 },
      { label: 'Sun', value: Math.round((mockTodayTotals.kcal / mockGoal.totals.kcal) * 100) },
    ],
    recentMeals: mockMeals.map((meal) => ({
      id: meal.id,
      name: meal.menuName,
      time: formatMealTime(meal.recordedAt),
      kcal: meal.totals.kcal,
    })),
  };
}
