'use client';

/*
 * 【責務】
 * Home 画面に表示する当日サマリー、今日のワークアウト、カロリー収支を組み立てる。
 */

import useSWR from 'swr';

import type { NutritionSummary } from '@/components/record-summary-card';
import { getTodayKey } from '@/lib/web-date';

import { buildNutritionSummary } from '../summary/build-nutrition-summary';
import { listDailySummary } from '../summary/api/list-daily-summary';
import { listCurrentGoal } from '../settings/api/list-current-goal';
import { getUserProfile } from '../settings/api/get-user-profile';
import { listTodayWorkoutLogs } from '../workouts/api/list-today-workout-logs';
import type { WorkoutLog } from '../workouts/types';
import { buildDailyEnergySummary } from './utils/build-daily-energy-summary';

export type UseHomeScreenResult = {
  summary: NutritionSummary;
  dailyEnergy: ReturnType<typeof buildDailyEnergySummary>;
  todayWorkoutLogs: WorkoutLog[];
  todayWorkoutBurnedKcal: number;
  isLoading: boolean;
};

export function useHomeScreen(): UseHomeScreenResult {
  const todayKey = getTodayKey();
  const { data: todaySummary, isLoading: isTodayLoading } = useSWR(
    `/summary/daily/${todayKey}`,
    () => listDailySummary(todayKey),
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
  const todayWorkoutBurnedKcal = todayWorkoutLogs.reduce((sum, log) => sum + log.burnedKcal, 0);

  return {
    summary: buildNutritionSummary(todaySummary ?? null, goal ?? null),
    dailyEnergy: buildDailyEnergySummary(
      profile,
      todaySummary?.totals.kcal ?? 0,
      todayWorkoutBurnedKcal,
    ),
    todayWorkoutLogs,
    todayWorkoutBurnedKcal,
    isLoading: isTodayLoading || isGoalLoading || isProfileLoading || isWorkoutLoading,
  };
}
