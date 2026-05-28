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
import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';

import type { WebMeal } from '@/domain/web-diet-schema';
import type { NutritionSummary } from '@/components/record-summary-card';
import { formatDateKey, getTodayKey, parseDateKey } from '@/lib/web-date';

import { listCurrentGoal } from '../../../settings/api/list-current-goal';
import { getUserProfile } from '../../../settings/api/get-user-profile';
import { listDailySummary } from '../../../summary/api/list-daily-summary';
import { recomputeDailySummaryForDateKey } from '../../../summary/api/recompute-daily-summary';
import { buildNutritionSummary } from '../../../summary/build-nutrition-summary';
import { deleteWorkoutLog } from '../../../workouts/api/delete-workout-log';
import { listTodayWorkoutLogs } from '../../../workouts/api/list-today-workout-logs';
import { requestWorkoutCalorieEstimate } from '../../../workouts/api/request-workout-calorie-estimate';
import { saveWorkoutLogAsMenu } from '../../../workouts/api/save-workout-log-as-menu';
import { updateWorkoutLog } from '../../../workouts/api/update-workout-log';
import type { WorkoutLogEditorValidationState, WorkoutLogEditorValues } from '../../../workouts/components/workout-log-editor-panel';
import type { WorkoutExerciseFormValues, WorkoutLog } from '../../../workouts/types';
import { buildWorkoutEditorExercises } from '../../../workouts/utils/build-workout-editor-exercises';
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
  focusMealId: string | null;
  feedbackMessage: string | null;
  feedbackTone: 'info' | 'error';
  editingMeal: WebMeal | null;
  isSavingEdit: boolean;
  savingMealId: string | null;
  activeWorkoutLogId: string | null;
  savingWorkoutLogId: string | null;
  editingWorkoutLog: WorkoutLog | null;
  workoutEditorValues: WorkoutLogEditorValues;
  workoutEditorValidation: WorkoutLogEditorValidationState;
  isSavingWorkoutEdit: boolean;
  isEstimatingWorkoutEdit: boolean;
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
  handleWorkoutEditorExerciseChange: (index: number, field: keyof WorkoutExerciseFormValues, value: string) => void;
  handleAddWorkoutEditorExercise: () => void;
  handleRemoveWorkoutEditorExercise: (index: number) => void;
  handleEstimateWorkoutEdit: () => Promise<void>;
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
  exercises: [
    {
      exerciseName: '',
      sets: '3',
      reps: '10',
      weightKg: '0',
      durationMinutes: '1',
    },
  ],
};

const EMPTY_WORKOUT_EXERCISE: WorkoutExerciseFormValues = {
  exerciseName: '',
  sets: '3',
  reps: '10',
  weightKg: '0',
  durationMinutes: '1',
};

function isPositiveInput(value: string): boolean {
  const numberValue = Number(value);

  return value.trim().length > 0 && Number.isFinite(numberValue) && numberValue > 0;
}

function buildWorkoutEditorInvalidKeys(values: WorkoutLogEditorValues): string[] {
  const invalidKeys: string[] = [];

  if (values.name.trim().length === 0) {
    invalidKeys.push('name');
  }

  if (!isPositiveInput(values.burnedKcal)) {
    invalidKeys.push('burnedKcal');
  }

  values.exercises.forEach((exercise, index) => {
    if (exercise.exerciseName.trim().length === 0) {
      invalidKeys.push(`exercise.${index}.exerciseName`);
    }

    if (!isPositiveInput(exercise.weightKg)) {
      invalidKeys.push(`exercise.${index}.weightKg`);
    }

    if (!isPositiveInput(exercise.reps)) {
      invalidKeys.push(`exercise.${index}.reps`);
    }

    if (!isPositiveInput(exercise.sets)) {
      invalidKeys.push(`exercise.${index}.sets`);
    }

    if (!isPositiveInput(exercise.durationMinutes)) {
      invalidKeys.push(`exercise.${index}.durationMinutes`);
    }
  });

  return invalidKeys;
}

export function useHistoryScreen(): UseHistoryScreenResult {
  const searchParams = useSearchParams();
  const initialView = searchParams.get('view') === 'workouts' ? 'workouts' : 'foods';
  const initialDate = searchParams.get('date');
  const focusMealId = searchParams.get('mealId');
  const [activeView, setActiveView] = useState<'foods' | 'workouts'>(initialView);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [feedbackTone, setFeedbackTone] = useState<'info' | 'error'>('info');
  const [editingMealId, setEditingMealId] = useState<string | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [savingMealId, setSavingMealId] = useState<string | null>(null);
  const [activeWorkoutLogId, setActiveWorkoutLogId] = useState<string | null>(null);
  const [savingWorkoutLogId, setSavingWorkoutLogId] = useState<string | null>(null);
  const [editingWorkoutLogId, setEditingWorkoutLogId] = useState<string | null>(null);
  const [workoutEditorValues, setWorkoutEditorValues] = useState<WorkoutLogEditorValues>(DEFAULT_WORKOUT_EDITOR_VALUES);
  const [workoutEditorValidation, setWorkoutEditorValidation] = useState<WorkoutLogEditorValidationState>({
    invalidKeys: [],
    focusKey: null,
    requestId: 0,
  });
  const [isSavingWorkoutEdit, setIsSavingWorkoutEdit] = useState(false);
  const [isEstimatingWorkoutEdit, setIsEstimatingWorkoutEdit] = useState(false);
  const [savedMealIds, setSavedMealIds] = useState<string[]>([]);
  const [selectedDateKey, setSelectedDateKey] = useState(initialDate?.trim() ? initialDate : getTodayKey());
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
  const { data: profile = null, isLoading: isProfileLoading } = useSWR(
    '/settings/user-profile',
    () => getUserProfile(),
    { fallbackData: null },
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
      exercises: log.exercises.map((exercise) => ({
        exerciseName: exercise.exerciseName,
        sets: String(exercise.sets),
        reps: String(exercise.reps),
        weightKg: String(exercise.weightKg),
        durationMinutes: String(Math.max(1, Math.round(exercise.durationMinutes / Math.max(1, exercise.sets)))),
      })),
    });
    setWorkoutEditorValidation({ invalidKeys: [], focusKey: null, requestId: 0 });
    clearFeedback();
  }

  function handleCloseEditWorkoutLog(): void {
    setEditingWorkoutLogId(null);
    setWorkoutEditorValues(DEFAULT_WORKOUT_EDITOR_VALUES);
    setWorkoutEditorValidation({ invalidKeys: [], focusKey: null, requestId: 0 });
  }

  function handleWorkoutEditorValueChange(field: keyof WorkoutLogEditorValues, value: string): void {
    setWorkoutEditorValidation({ invalidKeys: [], focusKey: null, requestId: 0 });
    setWorkoutEditorValues((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleWorkoutEditorExerciseChange(
    index: number,
    field: keyof WorkoutExerciseFormValues,
    value: string,
  ): void {
    setWorkoutEditorValidation({ invalidKeys: [], focusKey: null, requestId: 0 });
    setWorkoutEditorValues((current) => ({
      ...current,
      exercises: current.exercises.map((exercise, exerciseIndex) => (
        exerciseIndex === index ? { ...exercise, [field]: value } : exercise
      )),
    }));
  }

  function handleAddWorkoutEditorExercise(): void {
    setWorkoutEditorValidation({ invalidKeys: [], focusKey: null, requestId: 0 });
    setWorkoutEditorValues((current) => ({
      ...current,
      exercises: current.exercises.concat({ ...EMPTY_WORKOUT_EXERCISE }),
    }));
  }

  function handleRemoveWorkoutEditorExercise(index: number): void {
    setWorkoutEditorValidation({ invalidKeys: [], focusKey: null, requestId: 0 });
    setWorkoutEditorValues((current) => {
      if (current.exercises.length <= 1) {
        return current;
      }

      return {
        ...current,
        exercises: current.exercises.filter((_, exerciseIndex) => exerciseIndex !== index),
      };
    });
  }

  async function handleEstimateWorkoutEdit(): Promise<void> {
    const currentWeightKg = Number(profile?.current_weight_kg);
    const age = Number(profile?.age);
    const heightCm = Number(profile?.height_cm);
    const exercises = buildWorkoutEditorExercises(workoutEditorValues.exercises);

    if (
      workoutEditorValues.name.trim().length === 0
      || exercises === null
      || !Number.isFinite(currentWeightKg)
      || currentWeightKg <= 0
    ) {
      applyFeedback({ message: 'ワークアウト名、体重、種目を確認してください。', tone: 'error' });
      return;
    }

    setIsEstimatingWorkoutEdit(true);

    try {
      const estimate = await requestWorkoutCalorieEstimate({
        menuName: workoutEditorValues.name.trim(),
        exercises,
        durationMinutes: null,
        intensity: 'hard',
        currentWeightKg,
        age: Number.isFinite(age) && age > 0 ? age : null,
        gender: profile?.gender ?? null,
        heightCm: Number.isFinite(heightCm) && heightCm > 0 ? heightCm : null,
        chargeUsage: false,
      });

      if (estimate.source !== 'openai') {
        throw new Error('AI推定を取得できませんでした。OpenAI設定を確認してから再計算してください。');
      }

      setWorkoutEditorValues((current) => ({
        ...current,
        burnedKcal: String(Math.round(estimate.burnedKcal)),
      }));
      applyFeedback({ message: 'AIで消費カロリーを再計算しました。', tone: 'info' });
    } catch (error) {
      applyFeedback({
        message: error instanceof Error ? error.message : 'AI推定に失敗しました。',
        tone: 'error',
      });
    } finally {
      setIsEstimatingWorkoutEdit(false);
    }
  }

  async function handleUpdateWorkoutLog(): Promise<void> {
    if (editingWorkoutLog === null) {
      return;
    }

    const invalidKeys = buildWorkoutEditorInvalidKeys(workoutEditorValues);

    if (invalidKeys.length > 0) {
      setWorkoutEditorValidation((current) => ({
        invalidKeys,
        focusKey: invalidKeys[0] ?? null,
        requestId: current.requestId + 1,
      }));
      applyFeedback({ message: '入力が足りない項目があります。', tone: 'error' });
      return;
    }

    const burnedKcal = Number(workoutEditorValues.burnedKcal);
    const exercises = workoutEditorValues.kind === 'strength'
      ? buildWorkoutEditorExercises(workoutEditorValues.exercises)
      : [
        {
          exerciseName: workoutEditorValues.name.trim(),
          sets: 1,
          reps: 1,
          weightKg: 0,
          durationMinutes: Number(workoutEditorValues.durationMinutes),
        },
      ];
    const durationMinutes = exercises === null
      ? Number(workoutEditorValues.durationMinutes)
      : exercises.reduce((sum, exercise) => sum + exercise.durationMinutes, 0);

    if (
      workoutEditorValues.name.trim().length === 0
      || exercises === null
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
        exercises,
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
    focusMealId,
    feedbackMessage,
    feedbackTone,
    editingMeal,
    isSavingEdit,
    savingMealId,
    activeWorkoutLogId,
    savingWorkoutLogId,
    editingWorkoutLog,
    workoutEditorValues,
    workoutEditorValidation,
    isSavingWorkoutEdit,
    isEstimatingWorkoutEdit,
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
    handleWorkoutEditorExerciseChange,
    handleAddWorkoutEditorExercise,
    handleRemoveWorkoutEditorExercise,
    handleEstimateWorkoutEdit,
    handleUpdateWorkoutLog,
    handleSaveWorkoutLog,
    isLoading: isMealsLoading || isSummaryLoading || isGoalLoading || isWorkoutLogsLoading || isProfileLoading,
  };
}
