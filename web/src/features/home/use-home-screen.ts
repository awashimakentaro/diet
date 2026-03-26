'use client';

/**
 * web/src/features/home/use-home-screen.ts
 *
 * 【責務】
 * Home 画面に表示する日次集計ベースのサマリーと分析データを組み立てる。
 *
 * 【使用されるエージェント / 処理フロー】
 * - home-screen.tsx から呼ばれる。
 * - daily_summaries と recent meals を取得し、Home UI 向けに整形する。
 *
 * 【やらないこと】
 * - 永続化
 * - JSX 描画
 *
 * 【他ファイルとの関係】
 * - summary 配下の取得処理を利用する。
 * - record-summary-card.tsx へ渡す NutritionSummary を返す。
 */

import useSWR from 'swr';
import { useEffect } from 'react';

import { mockGoal } from '@/data/mock-diet-data';
import type { WebDailySummary } from '@/domain/web-diet-schema';
import type { NutritionSummary } from '@/features/record/components/record-summary-card';
import { getTodayKey, parseDateKey } from '@/lib/web-date';

import { buildNutritionSummary } from '../summary/build-nutrition-summary';
import { listDailySummary } from '../summary/list-daily-summary';
import { listRecentDailySummaries } from '../summary/list-recent-daily-summaries';
import { listRecentMeals } from '../summary/list-recent-meals';
import { recomputeRecentDailySummaries } from '../summary/recompute-recent-daily-summaries';

type HomeInsight = {
  label: string;
  value: string;
  description: string;
};

type HomeUsageBar = {
  label: string;
  value: number;
};

type HomeRecentMeal = Awaited<ReturnType<typeof listRecentMeals>>[number];

export type UseHomeScreenResult = {
  summary: NutritionSummary;
  consecutiveDays: number;
  insights: HomeInsight[];
  usageBars: HomeUsageBar[];
  recentMeals: HomeRecentMeal[];
};

function buildConsecutiveDays(summaries: WebDailySummary[]): number {
  const availableKeys = new Set(
    summaries
      .filter((summary) => summary.mealCount > 0)
      .map((summary) => summary.date),
  );
  let count = 0;
  const cursor = new Date();

  while (availableKeys.has(getTodayKeyFromDate(cursor))) {
    count += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return count;
}

function getTodayKeyFromDate(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function buildInsights(
  summaries: WebDailySummary[],
  todaySummary: WebDailySummary | null,
): HomeInsight[] {
  if (summaries.length === 0) {
    return [
      {
        label: '平均摂取カロリー',
        value: '0 kcal',
        description: 'まだ集計対象の履歴がありません。',
      },
      {
        label: '高たんぱくデー',
        value: '未記録',
        description: '履歴を記録すると高たんぱくだった日を表示します。',
      },
      {
        label: 'よく食べた食品',
        value: '未記録',
        description: '日次集計から頻出食品をまとめます。',
      },
    ];
  }

  const averageKcal = Math.round(
    summaries.reduce((sum, summary) => sum + summary.totals.kcal, 0) / summaries.length,
  );
  const highestProteinDay = [...summaries].sort(
    (left, right) => right.totals.protein - left.totals.protein,
  )[0];
  const topFoodCounts = new Map<string, number>();

  summaries.forEach((summary) => {
    summary.topFoods.forEach((food) => {
      topFoodCounts.set(food.name, (topFoodCounts.get(food.name) ?? 0) + food.count);
    });
  });

  const mostFrequentFood = [...topFoodCounts.entries()].sort(
    (left, right) => right[1] - left[1],
  )[0];

  return [
    {
      label: '平均摂取カロリー',
      value: `${averageKcal} kcal`,
      description: `直近 ${summaries.length} 日の平均です。`,
    },
    {
      label: '高たんぱくデー',
      value: `${highestProteinDay.totals.protein}g`,
      description: `${formatSummaryDate(highestProteinDay.date)} が最も高たんぱくでした。`,
    },
    {
      label: 'よく食べた食品',
      value: mostFrequentFood?.[0] ?? '未記録',
      description: todaySummary?.topFoods[0]
        ? `今日は ${todaySummary.topFoods[0].name} を中心に記録しています。`
        : '直近の記録から頻出食品を表示します。',
    },
  ];
}

function buildUsageBars(summaries: WebDailySummary[]): HomeUsageBar[] {
  return summaries.map((summary) => {
    const date = parseDateKey(summary.date);

    return {
      label: new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date),
      value: mockGoal.totals.kcal <= 0
        ? 0
        : Math.min(100, Math.round((summary.totals.kcal / mockGoal.totals.kcal) * 100)),
    };
  });
}

function formatSummaryDate(dateKey: string): string {
  return new Intl.DateTimeFormat('ja-JP', {
    month: 'numeric',
    day: 'numeric',
  }).format(parseDateKey(dateKey));
}

export function useHomeScreen(): UseHomeScreenResult {
  const todayKey = getTodayKey();
  const { data: todaySummary, mutate: mutateTodaySummary } = useSWR(
    `/summary/daily/${todayKey}`,
    () => listDailySummary(todayKey),
  );
  const { data: recentSummaries = [], mutate: mutateRecentSummaries } = useSWR(
    '/summary/daily/recent/7',
    () => listRecentDailySummaries(7),
    {
      fallbackData: [],
    },
  );
  const { data: recentMeals = [] } = useSWR(
    '/summary/recent-meals/4',
    () => listRecentMeals(4),
    {
      fallbackData: [],
    },
  );

  useEffect(() => {
    if (recentMeals.length === 0 || recentSummaries.length > 0) {
      return;
    }

    void (async () => {
      await recomputeRecentDailySummaries(7);
      await mutateRecentSummaries();
      await mutateTodaySummary();
    })();
  }, [
    mutateRecentSummaries,
    mutateTodaySummary,
    recentMeals.length,
    recentSummaries.length,
  ]);

  return {
    summary: buildNutritionSummary(todaySummary ?? null),
    consecutiveDays: buildConsecutiveDays(recentSummaries),
    insights: buildInsights(recentSummaries, todaySummary ?? null),
    usageBars: buildUsageBars(recentSummaries),
    recentMeals,
  };
}
