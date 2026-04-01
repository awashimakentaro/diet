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
import type { NutritionSummary } from '@/features/record/components/record-summary-card';
import { formatDateKey, getTodayKey, parseDateKey } from '@/lib/web-date';

import { buildNutritionSummary } from '../summary/build-nutrition-summary';
import { listCurrentGoal } from '../settings/api/list-current-goal';
import { listDailySummary } from '../summary/api/list-daily-summary';
import { recomputeDailySummaryForDateKey } from '../summary/api/recompute-daily-summary';
import { deleteHistoryMeal } from './api/delete-history-meal';
import { listHistoryMeals } from './api/list-history-meals';
import { saveHistoryMealToFoods } from './api/save-history-meal-to-foods';
import { updateHistoryMeal } from './api/update-history-meal';

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
    values: {
      mealName: string;
      items: Array<{
        name: string;
        amount: string;
        kcal: string;
        protein: string;
        fat: string;
        carbs: string;
      }>;
    },
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
      await recomputeDailySummaryForDateKey(selectedDateKey);
      await mutateDailySummary();
      await mutate();
      setFeedbackMessage('履歴から削除しました。');
      setFeedbackTone('info');
    } catch (error) {
      setFeedbackMessage(
        error instanceof Error
          ? error.message
          : '履歴を削除できませんでした。',
      );
      setFeedbackTone('error');
    }
  }

  function handleOpenEditMeal(mealId: string): void {
    setEditingMealId(mealId);
    setFeedbackMessage(null);
    setFeedbackTone('info');
  }

  function handleCloseEditMeal(): void {
    setEditingMealId(null);
  }

  async function handleUpdateMeal(
    mealId: string,
    values: {
      mealName: string;
      items: Array<{
        name: string;
        amount: string;
        kcal: string;
        protein: string;
        fat: string;
        carbs: string;
      }>;
    },
  ): Promise<void> {
    setIsSavingEdit(true);

    try {
      await updateHistoryMeal({
        mealId,
        mealName: values.mealName,
        items: values.items,
      });
      await recomputeDailySummaryForDateKey(selectedDateKey);
      await mutateDailySummary();
      await mutate();
      setFeedbackMessage('履歴を更新しました。');
      setFeedbackTone('info');
      setEditingMealId(null);
    } catch (error) {
      setFeedbackMessage(
        error instanceof Error
          ? error.message
          : '履歴を更新できませんでした。',
      );
      setFeedbackTone('error');
    } finally {
      setIsSavingEdit(false);
    }
  }

  async function handleSaveMeal(mealId: string): Promise<void> {
    if (savedMealIds.includes(mealId)) {
      return;
    }

    const targetMeal = meals.find((meal) => meal.id === mealId);

    if (!targetMeal) {
      return;
    }

    try {
      setSavingMealId(mealId);
      await saveHistoryMealToFoods(targetMeal);
      setSavedMealIds((current) => current.concat(mealId));
      setFeedbackMessage(null);
      setFeedbackTone('info');
    } catch (error) {
      setFeedbackMessage(
        error instanceof Error
          ? error.message
          : '食品タブへの保存に失敗しました。',
      );
      setFeedbackTone('error');
    } finally {
      setSavingMealId(null);
    }
  }

  function handleSelectDateKey(dateKey: string): void {
    if (dateKey.trim().length === 0) {
      return;
    }

    setSelectedDateKey(dateKey);
    setFeedbackMessage(null);
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
