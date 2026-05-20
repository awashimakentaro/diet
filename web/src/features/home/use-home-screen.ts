'use client';

/*
 * 【責務】
 * Home 画面に表示する当日サマリー、カロリー収支、体重推移を組み立てる。
 */

import useSWR from 'swr';

import type { NutritionSummary } from '@/components/record-summary-card';
import { getTodayKey } from '@/lib/web-date';

import { buildNutritionSummary } from '../summary/build-nutrition-summary';
import { listDailySummary } from '../summary/api/list-daily-summary';
import { listCurrentGoal } from '../settings/api/list-current-goal';
import { getUserProfile } from '../settings/api/get-user-profile';
import { listTodayWorkoutLogs } from '../workouts/api/list-today-workout-logs';
import { buildDailyEnergySummary } from './utils/build-daily-energy-summary';
import { listUserWeightLogs, type UserWeightLogPoint } from './api/list-user-weight-logs';

export type UseHomeScreenResult = {
  summary: NutritionSummary;
  dailyEnergy: ReturnType<typeof buildDailyEnergySummary>;
  weightLogs: UserWeightLogPoint[];
  isLoading: boolean;
};

export function useHomeScreen(): UseHomeScreenResult {
  const todayKey = getTodayKey();
  const { data: todaySummary, isLoading: isTodayLoading } = useSWR(
    `/summary/daily/${todayKey}`,
    () => listDailySummary(todayKey),
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
  const { data: profile = null, isLoading: isProfileLoading } = useSWR(
    '/settings/user-profile',
    () => getUserProfile(),
    {
      fallbackData: null,
    },
  );
  const { data: todayWorkoutLogs = [], isLoading: isWorkoutLoading } = useSWR(
    `/workouts/logs/${todayKey}`,
    () => listTodayWorkoutLogs(todayKey),
    {
      fallbackData: [],
    },
  );

  return {
    summary: buildNutritionSummary(todaySummary ?? null, goal ?? null),
    dailyEnergy: buildDailyEnergySummary(
      profile,
      todaySummary?.totals.kcal ?? 0,
      todayWorkoutLogs.reduce((sum, log) => sum + log.burnedKcal, 0),
    ),
    weightLogs,
    isLoading: isTodayLoading || isWeightLoading || isGoalLoading || isProfileLoading || isWorkoutLoading,
  };
}
