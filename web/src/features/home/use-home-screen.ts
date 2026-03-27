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
 * - list-user-weight-logs.ts で体重推移用ログを取得する。
 */

import { useEffect } from 'react';
import useSWR from 'swr';

import type { WebDailySummary } from '@/domain/web-diet-schema';
import type { NutritionSummary } from '@/features/record/components/record-summary-card';
import { formatDateKey, getTodayKey, parseDateKey } from '@/lib/web-date';

import { buildNutritionSummary } from '../summary/build-nutrition-summary';
import { listDailySummary } from '../summary/list-daily-summary';
import { listRecentMeals } from '../summary/list-recent-meals';
import { listWeekDailySummaries } from '../summary/list-week-daily-summaries';
import { recomputeRecentDailySummaries } from '../summary/recompute-recent-daily-summaries';
import { listCurrentGoal } from '../settings/list-current-goal';
import { listUserWeightLogs, type UserWeightLogPoint } from './list-user-weight-logs';

type HomeInsight = {
  label: string;
  value: string;
  description: string;
};

type HomeUsageBar = {
  label: string;
  value: number;
  kcal: number;
  hasRecord: boolean;
};

type HomeRecentMeal = Awaited<ReturnType<typeof listRecentMeals>>[number];

export type UseHomeScreenResult = {
  summary: NutritionSummary;
  consecutiveDays: number;
  insights: HomeInsight[];
  usageBars: HomeUsageBar[];
  recentMeals: HomeRecentMeal[];
  weightLogs: UserWeightLogPoint[];
  isLoading: boolean;
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
): HomeInsight[] {
  const recordedSummaries = summaries.filter((summary) => summary.mealCount > 0);

  if (recordedSummaries.length === 0) {
    return [
      {
        label: '平均摂取カロリー',
        value: '0 kcal',
        description: 'まだ集計対象の履歴がありません。',
      },
      {
        label: '平均たんぱく質',
        value: '0 g',
        description: '履歴を記録すると平均値を表示します。',
      },
    ];
  }

  const averageKcal = Math.round(
    recordedSummaries.reduce((sum, summary) => sum + summary.totals.kcal, 0)
    / recordedSummaries.length,
  );
  const averageProtein = Math.round(
    (recordedSummaries.reduce((sum, summary) => sum + summary.totals.protein, 0)
      / recordedSummaries.length) * 10,
  ) / 10;

  return [
    {
      label: '平均摂取カロリー',
      value: `${averageKcal} kcal`,
      description: `記録がある ${recordedSummaries.length} 日分の平均です。`,
    },
    {
      label: '平均たんぱく質',
      value: `${averageProtein} g`,
      description: `記録がある ${recordedSummaries.length} 日分の平均です。`,
    },
  ];
}

function buildUsageBars(summaries: WebDailySummary[]): HomeUsageBar[] {
  return summaries.map((summary) => {
    const date = parseDateKey(summary.date);
    const kcalCeiling = 3000;
    const normalizedValue = Math.min(
      100,
      Math.max(0, Math.round((summary.totals.kcal / kcalCeiling) * 100)),
    );

    return {
      label: new Intl.DateTimeFormat('ja-JP', { weekday: 'short' }).format(date),
      value: normalizedValue,
      kcal: Math.round(summary.totals.kcal),
      hasRecord: summary.mealCount > 0,
    };

  });
}

function getCurrentWeekRange(today: Date): { startDateKey: string; endDateKey: string } {
  const start = new Date(today);
  const day = start.getDay();
  const offsetFromMonday = day === 0 ? 6 : day - 1;
  start.setDate(start.getDate() - offsetFromMonday);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  return {
    startDateKey: formatDateKey(start),
    endDateKey: formatDateKey(end),
  };
}

function buildWeekDateKeys(today: Date): string[] {
  const { startDateKey } = getCurrentWeekRange(today);
  const start = parseDateKey(startDateKey);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return formatDateKey(date);
  });
}

function normalizeWeekSummaries(
  summaries: WebDailySummary[],
  weekDateKeys: string[],
): WebDailySummary[] {
  const summariesByDate = new Map(
    summaries.map((summary) => [summary.date, summary] as const),
  );

  return weekDateKeys.map((dateKey) => {
    const existingSummary = summariesByDate.get(dateKey);

    if (existingSummary) {
      return existingSummary;
    }

    return {
      date: dateKey,
      totals: {
        kcal: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
      },
      mealCount: 0,
      topFoods: [],
      updatedAt: '',
    };
  });
}

export function useHomeScreen(): UseHomeScreenResult {
  const todayKey = getTodayKey();
  const weekRange = getCurrentWeekRange(new Date());
  const weekDateKeys = buildWeekDateKeys(new Date());
  const { data: todaySummary, isLoading: isTodayLoading, mutate: mutateTodaySummary } = useSWR(
    `/summary/daily/${todayKey}`,
    () => listDailySummary(todayKey),
  );
  const { data: weeklySummaries = [], isLoading: isWeeklyLoading, mutate: mutateWeeklySummaries } = useSWR(
    `/summary/daily/week/${weekRange.startDateKey}-${weekRange.endDateKey}`,
    () => listWeekDailySummaries(weekRange),
    {
      fallbackData: [],
    },
  );
  const { data: recentMeals = [], isLoading: isRecentLoading } = useSWR(
    '/summary/recent-meals/4',
    () => listRecentMeals(4),
    {
      fallbackData: [],
    },
  );
  const { data: weightLogs = [], isLoading: isWeightLoading } = useSWR(
    '/home/user-weight-logs/12',
    () => listUserWeightLogs(12),
    {
      fallbackData: [],
    },
  );
  const { data: goal, isLoading: isGoalLoading } = useSWR(
    '/settings/current-goal',
    () => listCurrentGoal(),
  );

  useEffect(() => {
    if (recentMeals.length === 0 || weeklySummaries.length > 0) {
      return;
    }

    void (async () => {
      await recomputeRecentDailySummaries(7);
      await mutateWeeklySummaries();
      await mutateTodaySummary();
    })();
  }, [
    mutateWeeklySummaries,
    mutateTodaySummary,
    recentMeals.length,
    weeklySummaries.length,
  ]);

  const normalizedWeeklySummaries = normalizeWeekSummaries(
    weeklySummaries,
    weekDateKeys,
  );

  return {
    summary: buildNutritionSummary(todaySummary ?? null, goal ?? null),
    consecutiveDays: buildConsecutiveDays(weeklySummaries),
    insights: buildInsights(weeklySummaries),
    usageBars: buildUsageBars(normalizedWeeklySummaries),
    recentMeals,
    weightLogs,
    isLoading: isTodayLoading || isWeeklyLoading || isRecentLoading || isWeightLoading || isGoalLoading,
  };
}
