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

import { listCurrentGoal } from '../../../settings/api/list-current-goal';
import { listDailySummary } from '../../../summary/api/list-daily-summary';
import { recomputeDailySummaryForDateKey } from '../../../summary/api/recompute-daily-summary';
import { buildNutritionSummary } from '../../../summary/build-nutrition-summary';
import { deleteWorkoutLog } from '../../../workouts/api/delete-workout-log';
import { listTodayWorkoutLogs } from '../../../workouts/api/list-today-workout-logs';
import { saveWorkoutLogAsMenu } from '../../../workouts/api/save-workout-log-as-menu';
import { updateWorkoutLog } from '../../../workouts/api/update-workout-log';
import type { WorkoutLogEditorValues } from '../../../workouts/components/workout-log-editor-panel';
import type { WorkoutLog } from '../../../workouts/types';
import { deleteHistoryMeal } from '../../api/delete-history-meal';
import { listHistoryMeals } from '../../api/list-history-meals';
import { saveHistoryMealToFoods } from '../../api/save-history-meal-to-foods';
import { updateHistoryMeal } from '../../api/update-history-meal';
import type { HistoryMealUpdateValues } from '../../schemas/history-meal-update-values';
import {
  buildHistoryDeleteErrorFeedback,
  buildHistoryDeleteSuccessFeedback,
  syncHistoryAfterDelete,
} from '../../utils/delete';
import {
  buildHistorySaveMealErrorFeedback,
  buildHistorySaveMealSuccessFeedback,
  canSaveHistoryMeal,
  findHistoryMealById,
} from '../../utils/save';
import {
  buildHistoryUpdateErrorFeedback,
  buildHistoryUpdateSuccessFeedback,
  syncHistoryAfterUpdate,
} from '../../utils/update';

export type UseHistoryScreenResult = {
  meals: WebMeal[];
  workoutLogs: WorkoutLog[];
  summary: NutritionSummary;
  selectedDateValue: string;
  selectedDateLabel: string;
  activeView: 'foods' | 'workouts';
  feedbackMessage: string | null;
  feedbackTone: 'info' | 'error';
  editingMeal: WebMeal | null;
  isSavingEdit: boolean;
  savingMealId: string | null;
  activeWorkoutLogId: string | null;
  savingWorkoutLogId: string | null;
  editingWorkoutLog: WorkoutLog | null;
  workoutEditorValues: WorkoutLogEditorValues;
  isSavingWorkoutEdit: boolean;
  savedMealIds: string[];
  badgeCount: number;
  workoutBurnedKcal: number;
  handleSelectView: (view: 'foods' | 'workouts') => void;
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
  handleDeleteWorkoutLog: (logId: string) => void;
  handleOpenEditWorkoutLog: (log: WorkoutLog) => void;
  handleCloseEditWorkoutLog: () => void;
  handleWorkoutEditorValueChange: (field: keyof WorkoutLogEditorValues, value: string) => void;
  handleUpdateWorkoutLog: () => Promise<void>;
  handleSaveWorkoutLog: (log: WorkoutLog) => void;
  isLoading: boolean;
};

const DEFAULT_WORKOUT_EDITOR_VALUES: WorkoutLogEditorValues = {
  kind: 'strength',
  name: '',
  durationMinutes: '',
  intensity: 'normal',
  burnedKcal: '',
  note: '',
};

export function useHistoryScreen(): UseHistoryScreenResult {
  const [activeView, setActiveView] = useState<'foods' | 'workouts'>('foods');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [feedbackTone, setFeedbackTone] = useState<'info' | 'error'>('info');
  const [editingMealId, setEditingMealId] = useState<string | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [savingMealId, setSavingMealId] = useState<string | null>(null);
  const [activeWorkoutLogId, setActiveWorkoutLogId] = useState<string | null>(null);
  const [savingWorkoutLogId, setSavingWorkoutLogId] = useState<string | null>(null);
  const [editingWorkoutLogId, setEditingWorkoutLogId] = useState<string | null>(null);
  const [workoutEditorValues, setWorkoutEditorValues] = useState<WorkoutLogEditorValues>(DEFAULT_WORKOUT_EDITOR_VALUES);
  const [isSavingWorkoutEdit, setIsSavingWorkoutEdit] = useState(false);
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
  const { data: workoutLogsData, mutate: mutateWorkoutLogs, isLoading: isWorkoutLogsLoading } = useSWR(
    `/workouts/logs/${selectedDateKey}`,
    () => listTodayWorkoutLogs(selectedDateKey),
    { fallbackData: [] },
  );

  const meals = useMemo(() => {
    return data ?? [];
  }, [data]);
  const workoutLogs = useMemo(() => workoutLogsData ?? [], [workoutLogsData]);
  const workoutBurnedKcal = useMemo(
    () => workoutLogs.reduce((sum, log) => sum + log.burnedKcal, 0),
    [workoutLogs],
  );
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
  const editingWorkoutLog = useMemo(() => {
    if (editingWorkoutLogId === null) {
      return null;
    }

    return workoutLogs.find((log) => log.id === editingWorkoutLogId) ?? null;
  }, [editingWorkoutLogId, workoutLogs]);

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

  function handleSelectView(view: 'foods' | 'workouts'): void {
    setActiveView(view);
    clearFeedback();
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

  async function handleDeleteWorkoutLog(logId: string): Promise<void> {
    setActiveWorkoutLogId(logId);
    clearFeedback();

    try {
      await deleteWorkoutLog(logId);
      await mutateWorkoutLogs();
      await recomputeDailySummaryForDateKey(selectedDateKey);
      await mutateDailySummary();
      applyFeedback({ message: 'ワークアウト記録を削除しました。', tone: 'info' });
    } catch (error) {
      applyFeedback({
        message: error instanceof Error ? error.message : 'ワークアウト記録の削除に失敗しました。',
        tone: 'error',
      });
    } finally {
      setActiveWorkoutLogId(null);
    }
  }

  function handleOpenEditWorkoutLog(log: WorkoutLog): void {
    setEditingWorkoutLogId(log.id);
    setWorkoutEditorValues({
      kind: log.kind,
      name: log.name,
      durationMinutes: String(log.durationMinutes),
      intensity: log.intensity,
      burnedKcal: String(Math.round(log.burnedKcal)),
      note: log.note,
    });
    clearFeedback();
  }

  function handleCloseEditWorkoutLog(): void {
    setEditingWorkoutLogId(null);
    setWorkoutEditorValues(DEFAULT_WORKOUT_EDITOR_VALUES);
  }

  function handleWorkoutEditorValueChange(field: keyof WorkoutLogEditorValues, value: string): void {
    setWorkoutEditorValues((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleUpdateWorkoutLog(): Promise<void> {
    if (editingWorkoutLog === null) {
      return;
    }

    const durationMinutes = Number(workoutEditorValues.durationMinutes);
    const burnedKcal = Number(workoutEditorValues.burnedKcal);

    if (
      workoutEditorValues.name.trim().length === 0
      || !Number.isFinite(durationMinutes)
      || durationMinutes <= 0
      || !Number.isFinite(burnedKcal)
      || burnedKcal < 0
    ) {
      applyFeedback({ message: 'ワークアウト名、時間、消費カロリーを確認してください。', tone: 'error' });
      return;
    }

    setIsSavingWorkoutEdit(true);

    try {
      await updateWorkoutLog({
        logId: editingWorkoutLog.id,
        kind: workoutEditorValues.kind,
        name: workoutEditorValues.name.trim(),
        durationMinutes,
        intensity: workoutEditorValues.intensity,
        burnedKcal,
        note: workoutEditorValues.note.trim(),
      });
      await mutateWorkoutLogs();
      await recomputeDailySummaryForDateKey(selectedDateKey);
      await mutateDailySummary();
      applyFeedback({ message: 'ワークアウト履歴を更新しました。', tone: 'info' });
      handleCloseEditWorkoutLog();
    } catch (error) {
      applyFeedback({
        message: error instanceof Error ? error.message : 'ワークアウト履歴の更新に失敗しました。',
        tone: 'error',
      });
    } finally {
      setIsSavingWorkoutEdit(false);
    }
  }

  async function handleSaveWorkoutLog(log: WorkoutLog): Promise<void> {
    setSavingWorkoutLogId(log.id);
    clearFeedback();

    try {
      await saveWorkoutLogAsMenu(log);
      applyFeedback({ message: 'ワークアウトを食品タブの筋トレメニューに保存しました。', tone: 'info' });
    } catch (error) {
      applyFeedback({
        message: error instanceof Error ? error.message : 'ワークアウトの保存に失敗しました。',
        tone: 'error',
      });
    } finally {
      setSavingWorkoutLogId(null);
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
    workoutLogs,
    summary,
    selectedDateValue: selectedDateKey,
    selectedDateLabel,
    activeView,
    feedbackMessage,
    feedbackTone,
    editingMeal,
    isSavingEdit,
    savingMealId,
    activeWorkoutLogId,
    savingWorkoutLogId,
    editingWorkoutLog,
    workoutEditorValues,
    isSavingWorkoutEdit,
    savedMealIds,
    badgeCount: meals.length,
    workoutBurnedKcal,
    handleSelectView,
    handleSelectDateKey,
    handleShiftDate,
    handleSelectToday,
    handleDeleteMeal,
    handleOpenEditMeal,
    handleCloseEditMeal,
    handleUpdateMeal,
    handleSaveMeal,
    handleDeleteWorkoutLog,
    handleOpenEditWorkoutLog,
    handleCloseEditWorkoutLog,
    handleWorkoutEditorValueChange,
    handleUpdateWorkoutLog,
    handleSaveWorkoutLog,
    isLoading: isMealsLoading || isSummaryLoading || isGoalLoading || isWorkoutLogsLoading,
  };
}
