'use client';

/**
 * web/src/features/history/use-history-screen.ts
 *
 * 【責務】
 * History 画面の表示対象履歴とローカル操作 state をまとめる。
 *
 * 【使用されるエージェント / 処理フロー】
 * - web/src/app/app/history/_components/history-page-screen.tsx から呼ばれる。
 * - Supabase から選択日履歴を取得し、削除操作を接続する。
 *
 * 【やらないこと】
 * - JSX 描画
 *
 * 【他ファイルとの関係】
 * - api/list-history-meals.ts と api/delete-history-meal.ts を利用する。
 * - history-entry-card.tsx へ state とハンドラを渡す。
 */

import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';

import type { WebMeal } from '@/domain/web-diet-schema';
import type { NutritionSummary } from '@/components/record-summary-card';
import { formatDateKey, getTodayKey, parseDateKey } from '@/lib/web-date';

import { listCurrentGoal } from '../../settings/api/list-current-goal';
import { listDailySummary } from '../../summary/api/list-daily-summary';
import { recomputeDailySummaryForDateKey } from '../../summary/api/recompute-daily-summary';
import { buildNutritionSummary } from '../../summary/build-nutrition-summary';
import { deleteHistoryMeal } from '../api/delete-history-meal';
import { listHistoryMeals } from '../api/list-history-meals';
import { saveHistoryMealToFoods } from '../api/save-history-meal-to-foods';
import { updateHistoryMeal } from '../api/update-history-meal';
import type { HistoryMealUpdateValues } from '../schemas/history-meal-update-values';
import { buildHistoryDeleteErrorFeedback } from '../usecases/delete/build-history-delete-error-feedback';
import { buildHistoryDeleteSuccessFeedback } from '../usecases/delete/build-history-delete-success-feedback';
import { syncHistoryAfterDelete } from '../usecases/delete/sync-history-after-delete';
import { buildHistorySaveMealErrorFeedback } from '../usecases/save/build-history-save-meal-error-feedback';
import { buildHistorySaveMealSuccessFeedback } from '../usecases/save/build-history-save-meal-success-feedback';
import { canSaveHistoryMeal } from '../usecases/save/can-save-history-meal';
import { findHistoryMealById } from '../usecases/save/find-history-meal-by-id';
import { buildHistoryUpdateErrorFeedback } from '../usecases/update/build-history-update-error-feedback';
import { buildHistoryUpdateSuccessFeedback } from '../usecases/update/build-history-update-success-feedback';
import { syncHistoryAfterUpdate } from '../usecases/update/sync-history-after-update';

export type UseHistoryScreenResult = {
  meals: WebMeal[];
  summary: NutritionSummary;
  selectedDateValue: string;
  selectedDateLabel: string;
  feedbackMessage: string | null;
  feedbackTone: 'info' | 'error';
  editingMeal: WebMeal | null;
  isSavingEdit: boolean;
  savingMealId: string | null;
  savedMealIds: string[];
  badgeCount: number;
  handleSelectDateKey: (dateKey: string) => void;
  handleShiftDate: (days: number) => void;
  handleSelectToday: () => void;
  handleDeleteMeal: (mealId: string) => void;
  handleOpenEditMeal: (mealId: string) => void;
  handleCloseEditMeal: () => void;
  handleUpdateMeal: (
    mealId: string,
    values: HistoryMealUpdateValues,
  ) => Promise<void>;
  handleSaveMeal: (mealId: string) => void;
  isLoading: boolean;
};

export function useHistoryScreen(): UseHistoryScreenResult {
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [feedbackTone, setFeedbackTone] = useState<'info' | 'error'>('info');
  const [editingMealId, setEditingMealId] = useState<string | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [savingMealId, setSavingMealId] = useState<string | null>(null);
  const [savedMealIds, setSavedMealIds] = useState<string[]>([]);
  const [selectedDateKey, setSelectedDateKey] = useState(getTodayKey());
  const { data, mutate, isLoading: isMealsLoading } = useSWR(
    `/history/meals/${selectedDateKey}`,
    () => listHistoryMeals(selectedDateKey),
    {
      fallbackData: [],
    },
  );
  const { data: dailySummary, isLoading: isSummaryLoading, mutate: mutateDailySummary } = useSWR(
    `/summary/daily/${selectedDateKey}`,
    () => listDailySummary(selectedDateKey),
  );
  const { data: goal, isLoading: isGoalLoading } = useSWR(
    '/settings/current-goal',
    () => listCurrentGoal(),
  );

  const meals = useMemo(() => {
    return data ?? [];
  }, [data]);
  const selectedDateLabel = useMemo(() => {
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      weekday: 'short',
    }).format(parseDateKey(selectedDateKey));
  }, [selectedDateKey]);
  const summary = useMemo(() => buildNutritionSummary(dailySummary ?? null, goal ?? null), [dailySummary, goal]);
  const editingMeal = useMemo(() => {
    if (editingMealId === null) {
      return null;
    }

    return meals.find((meal) => meal.id === editingMealId) ?? null;
  }, [editingMealId, meals]);

  function applyFeedback(feedback: {
    message: string | null;
    tone: 'info' | 'error';
  }): void {
    setFeedbackMessage(feedback.message);
    setFeedbackTone(feedback.tone);
  }

  function clearFeedback(): void {
    setFeedbackMessage(null);
    setFeedbackTone('info');
  }

  useEffect(() => {
    if (dailySummary !== null || meals.length === 0) {
      return;
    }

    void (async () => {
      await recomputeDailySummaryForDateKey(selectedDateKey);
      await mutateDailySummary();
    })();
  }, [dailySummary, meals.length, mutateDailySummary, selectedDateKey]);

  async function handleDeleteMeal(mealId: string): Promise<void> {
    try {
      await deleteHistoryMeal(mealId);
      await syncHistoryAfterDelete({
        selectedDateKey,
        recomputeDailySummaryForDateKey,
        mutateDailySummary,
        mutateMeals: mutate,
      });
      applyFeedback(buildHistoryDeleteSuccessFeedback());
    } catch (error) {
      applyFeedback(buildHistoryDeleteErrorFeedback(error));
    }
  }

  function handleOpenEditMeal(mealId: string): void {
    setEditingMealId(mealId);
    clearFeedback();
  }

  function handleCloseEditMeal(): void {
    setEditingMealId(null);
  }

  async function handleUpdateMeal(
    mealId: string,
    values: HistoryMealUpdateValues,
  ): Promise<void> {
    setIsSavingEdit(true);

    try {
      await updateHistoryMeal({
        mealId,
        mealName: values.mealName,
        items: values.items,
      });
      await syncHistoryAfterUpdate({
        selectedDateKey,
        recomputeDailySummaryForDateKey,
        mutateDailySummary,
        mutateMeals: mutate,
      });
      applyFeedback(buildHistoryUpdateSuccessFeedback());
      setEditingMealId(null);
    } catch (error) {
      applyFeedback(buildHistoryUpdateErrorFeedback(error));
    } finally {
      setIsSavingEdit(false);
    }
  }

  async function handleSaveMeal(mealId: string): Promise<void> {
    if (!canSaveHistoryMeal({ mealId, savedMealIds })) {
      return;
    }

    const targetMeal = findHistoryMealById({
      mealId,
      meals,
    });

    if (!targetMeal) {
      return;
    }

    try {
      setSavingMealId(mealId);
      await saveHistoryMealToFoods(targetMeal);
      setSavedMealIds((current) => current.concat(mealId));
      applyFeedback(buildHistorySaveMealSuccessFeedback());
    } catch (error) {
      applyFeedback(buildHistorySaveMealErrorFeedback(error));
    } finally {
      setSavingMealId(null);
    }
  }

  function handleSelectDateKey(dateKey: string): void {
    if (dateKey.trim().length === 0) {
      return;
    }

    setSelectedDateKey(dateKey);
    clearFeedback();
  }

  function handleShiftDate(days: number): void {
    const base = parseDateKey(selectedDateKey);
    base.setDate(base.getDate() + days);
    handleSelectDateKey(formatDateKey(base));
  }

  function handleSelectToday(): void {
    handleSelectDateKey(getTodayKey());
  }

  return {
    meals,
    summary,
    selectedDateValue: selectedDateKey,
    selectedDateLabel,
    feedbackMessage,
    feedbackTone,
    editingMeal,
    isSavingEdit,
    savingMealId,
    savedMealIds,
    badgeCount: meals.length,
    handleSelectDateKey,
    handleShiftDate,
    handleSelectToday,
    handleDeleteMeal,
    handleOpenEditMeal,
    handleCloseEditMeal,
    handleUpdateMeal,
    handleSaveMeal,
    isLoading: isMealsLoading || isSummaryLoading || isGoalLoading,
  };
}
