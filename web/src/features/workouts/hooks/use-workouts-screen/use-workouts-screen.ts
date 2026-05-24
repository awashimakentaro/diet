/* 【責務】
 * Workouts 画面の入力状態・保存・実施記録を管理する。
 */

'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import useSWR from 'swr';

import { paths } from '@/config/paths';
import { getTodayKey } from '@/lib/web-date';
import { getUserProfile } from '@/features/settings/api/get-user-profile';

import { createOtherWorkoutLog } from '../../api/create-other-workout-log';
import { createOtherWorkoutMenu } from '../../api/create-other-workout-menu';
import { createWorkoutLog } from '../../api/create-workout-log';
import { createWorkoutMenu } from '../../api/create-workout-menu';
import { deleteWorkoutLog } from '../../api/delete-workout-log';
import { deleteWorkoutMenu } from '../../api/delete-workout-menu';
import { listTodayWorkoutLogs } from '../../api/list-today-workout-logs';
import { listWorkoutMenus } from '../../api/list-workout-menus';
import { logWorkoutMenu } from '../../api/log-workout-menu';
import { requestWorkoutCalorieEstimate } from '../../api/request-workout-calorie-estimate';
import type { OtherWorkoutFormValues, WorkoutMenu, WorkoutMenuFormValues } from '../../types';
import { buildOtherWorkoutLogPayload } from '../../utils/build-other-workout-log-payload';
import { buildWorkoutMenuPayload } from '../../utils/build-workout-menu-payload';
import { useWorkoutAiUsageLimit } from '../use-workout-ai-usage-limit';

type FeedbackTone = 'success' | 'error';

export type UseWorkoutsScreenResult = {
  formValues: WorkoutMenuFormValues;
  otherWorkoutValues: OtherWorkoutFormValues;
  menus: WorkoutMenu[];
  todayLogs: Awaited<ReturnType<typeof listTodayWorkoutLogs>>;
  todayBurnedKcal: number;
  feedbackMessage: string | null;
  feedbackTone: FeedbackTone;
  activeMenuId: string | null;
  activeLogId: string | null;
  isLoading: boolean;
  isSaving: boolean;
  isSavingOtherWorkout: boolean;
  workoutAiLimit: {
    isLoading: boolean;
    used: number;
    limit: number;
    isUnlimited: boolean;
    isReached: boolean;
  };
  handleValueChange: (field: keyof WorkoutMenuFormValues, value: string) => void;
  handleOtherWorkoutValueChange: (field: keyof OtherWorkoutFormValues, value: string) => void;
  handleExerciseValueChange: (index: number, field: keyof WorkoutMenuFormValues['exercises'][number], value: string) => void;
  handleAddExercise: () => void;
  handleRemoveExercise: (index: number) => void;
  handleCreateMenu: () => Promise<void>;
  handleCreateMenuLog: () => Promise<void>;
  handleDeleteMenu: (menuId: string) => Promise<void>;
  handleLogMenu: (menu: WorkoutMenu) => Promise<void>;
  handleDeleteLog: (logId: string) => Promise<void>;
  handleCreateOtherWorkoutLog: () => Promise<void>;
  handleSaveOtherWorkoutMenu: () => Promise<void>;
};

const DEFAULT_FORM_VALUES: WorkoutMenuFormValues = {
  name: '',
  exercises: [
    {
      exerciseName: '',
      sets: '3',
      reps: '10',
      weightKg: '0',
    },
  ],
  durationMinutes: '30',
  intensity: 'hard',
  note: '',
};

const DEFAULT_OTHER_WORKOUT_VALUES: OtherWorkoutFormValues = {
  name: '',
  durationMinutes: '',
  burnedKcal: '',
  note: '',
};

export function useWorkoutsScreen(): UseWorkoutsScreenResult {
  const router = useRouter();
  const todayKey = getTodayKey();
  const workoutAiLimit = useWorkoutAiUsageLimit();
  const [formValues, setFormValues] = useState<WorkoutMenuFormValues>(DEFAULT_FORM_VALUES);
  const [otherWorkoutValues, setOtherWorkoutValues] = useState<OtherWorkoutFormValues>(DEFAULT_OTHER_WORKOUT_VALUES);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [feedbackTone, setFeedbackTone] = useState<FeedbackTone>('success');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [activeLogId, setActiveLogId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingOtherWorkout, setIsSavingOtherWorkout] = useState(false);
  const { data: menus = [], isLoading: isMenusLoading, mutate: mutateMenus } = useSWR(
    '/workouts/menus',
    listWorkoutMenus,
    { fallbackData: [] },
  );
  const { data: todayLogs = [], isLoading: isLogsLoading, mutate: mutateTodayLogs } = useSWR(
    `/workouts/logs/${todayKey}`,
    () => listTodayWorkoutLogs(todayKey),
    { fallbackData: [] },
  );
  const todayBurnedKcal = useMemo(
    () => todayLogs.reduce((sum, log) => sum + log.burnedKcal, 0),
    [todayLogs],
  );

  function handleValueChange(field: keyof WorkoutMenuFormValues, value: string): void {
    setFormValues((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleOtherWorkoutValueChange(field: keyof OtherWorkoutFormValues, value: string): void {
    setOtherWorkoutValues((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleExerciseValueChange(
    index: number,
    field: keyof WorkoutMenuFormValues['exercises'][number],
    value: string,
  ): void {
    setFormValues((current) => ({
      ...current,
      exercises: current.exercises.map((exercise, exerciseIndex) => (
        exerciseIndex === index
          ? { ...exercise, [field]: value }
          : exercise
      )),
    }));
  }

  function handleAddExercise(): void {
    setFormValues((current) => ({
      ...current,
      exercises: [
        ...current.exercises,
        {
          exerciseName: '',
          sets: '3',
          reps: '10',
          weightKg: '0',
        },
      ],
    }));
  }

  function handleRemoveExercise(index: number): void {
    setFormValues((current) => {
      if (current.exercises.length <= 1) {
        return current;
      }

      return {
        ...current,
        exercises: current.exercises.filter((_, exerciseIndex) => exerciseIndex !== index),
      };
    });
  }

  async function handleCreateMenu(): Promise<void> {
    const result = buildWorkoutMenuPayload(formValues);

    if (!result.ok) {
      setFeedbackTone('error');
      setFeedbackMessage('未入力または数値が不正な項目があります。');
      return;
    }

    setIsSaving(true);
    setFeedbackMessage(null);

    try {
      const profile = await getUserProfile();
      const currentWeightKg = Number(profile?.current_weight_kg);

      if (!Number.isFinite(currentWeightKg) || currentWeightKg <= 0) {
        throw new Error('プロフィールに現在の体重を保存してください。');
      }

      const estimate = await requestWorkoutCalorieEstimate({
        menuName: result.payload.name,
        exercises: result.payload.exercises,
        durationMinutes: result.payload.durationMinutes,
        intensity: result.payload.intensity,
        currentWeightKg,
      });

      await createWorkoutMenu({
        ...result.payload,
        estimatedBurnedKcal: estimate.burnedKcal,
      });
      await mutateMenus();
      await workoutAiLimit.refresh();
      setFormValues(DEFAULT_FORM_VALUES);
      setFeedbackTone('success');
      setFeedbackMessage(
        estimate.source === 'openai'
          ? 'OpenAI 推定カロリー付きで筋トレメニューを保存しました。'
          : '概算カロリー付きで筋トレメニューを保存しました。',
      );
    } catch (error) {
      setFeedbackTone('error');
      setFeedbackMessage(error instanceof Error ? error.message : '保存に失敗しました。');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCreateMenuLog(): Promise<void> {
    const result = buildWorkoutMenuPayload(formValues);

    if (!result.ok) {
      setFeedbackTone('error');
      setFeedbackMessage('未入力または数値が不正な項目があります。');
      return;
    }

    setIsSaving(true);
    setFeedbackMessage(null);

    try {
      const profile = await getUserProfile();
      const currentWeightKg = Number(profile?.current_weight_kg);

      if (!Number.isFinite(currentWeightKg) || currentWeightKg <= 0) {
        throw new Error('プロフィールに現在の体重を保存してください。');
      }

      const estimate = await requestWorkoutCalorieEstimate({
        menuName: result.payload.name,
        exercises: result.payload.exercises,
        durationMinutes: result.payload.durationMinutes,
        intensity: result.payload.intensity,
        currentWeightKg,
      });

      await createWorkoutLog({
        ...result.payload,
        burnedKcal: estimate.burnedKcal,
      });
      await mutateTodayLogs();
      await workoutAiLimit.refresh();
      setFormValues(DEFAULT_FORM_VALUES);
      setFeedbackTone('success');
      setFeedbackMessage(
        estimate.source === 'openai'
          ? '保存しました。履歴タブで今日の筋トレ記録を確認できます。'
          : '保存しました。履歴タブで今日の筋トレ記録を確認できます。',
      );
      router.push(`${paths.app.history.getHref()}?view=workouts`);
    } catch (error) {
      await workoutAiLimit.refresh();
      setFeedbackTone('error');
      setFeedbackMessage(error instanceof Error ? error.message : '今日の記録への追加に失敗しました。');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteMenu(menuId: string): Promise<void> {
    setActiveMenuId(menuId);
    setFeedbackMessage(null);

    try {
      await deleteWorkoutMenu(menuId);
      await mutateMenus();
      setFeedbackTone('success');
      setFeedbackMessage('筋トレメニューを削除しました。');
    } catch (error) {
      setFeedbackTone('error');
      setFeedbackMessage(error instanceof Error ? error.message : '削除に失敗しました。');
    } finally {
      setActiveMenuId(null);
    }
  }

  async function handleLogMenu(menu: WorkoutMenu): Promise<void> {
    setActiveMenuId(menu.id);
    setFeedbackMessage(null);

    try {
      await logWorkoutMenu(menu);
      await mutateTodayLogs();
      setFeedbackTone('success');
      setFeedbackMessage('今日の筋トレとして記録しました。');
    } catch (error) {
      setFeedbackTone('error');
      setFeedbackMessage(error instanceof Error ? error.message : '記録に失敗しました。');
    } finally {
      setActiveMenuId(null);
    }
  }

  async function handleDeleteLog(logId: string): Promise<void> {
    setActiveLogId(logId);
    setFeedbackMessage(null);

    try {
      await deleteWorkoutLog(logId);
      await mutateTodayLogs();
      setFeedbackTone('success');
      setFeedbackMessage('今日の筋トレ記録を削除しました。');
    } catch (error) {
      setFeedbackTone('error');
      setFeedbackMessage(error instanceof Error ? error.message : '記録の削除に失敗しました。');
    } finally {
      setActiveLogId(null);
    }
  }

  async function handleCreateOtherWorkoutLog(): Promise<void> {
    const result = buildOtherWorkoutLogPayload(otherWorkoutValues);

    if (!result.ok) {
      setFeedbackTone('error');
      setFeedbackMessage('ワークアウト名、時間、消費カロリーを入力してください。');
      return;
    }

    setIsSavingOtherWorkout(true);
    setFeedbackMessage(null);

    try {
      await createOtherWorkoutLog(result.payload);
      await mutateTodayLogs();
      setOtherWorkoutValues(DEFAULT_OTHER_WORKOUT_VALUES);
      setFeedbackTone('success');
      setFeedbackMessage('保存しました。履歴タブで今日のワークアウト記録を確認できます。');
    } catch (error) {
      setFeedbackTone('error');
      setFeedbackMessage(error instanceof Error ? error.message : 'ワークアウト記録の保存に失敗しました。');
    } finally {
      setIsSavingOtherWorkout(false);
    }
  }

  async function handleSaveOtherWorkoutMenu(): Promise<void> {
    const result = buildOtherWorkoutLogPayload(otherWorkoutValues);

    if (!result.ok) {
      setFeedbackTone('error');
      setFeedbackMessage('ワークアウト名、時間、消費カロリーを入力してください。');
      return;
    }

    setIsSavingOtherWorkout(true);
    setFeedbackMessage(null);

    try {
      await createOtherWorkoutMenu(result.payload);
      await mutateMenus();
      setOtherWorkoutValues(DEFAULT_OTHER_WORKOUT_VALUES);
      setFeedbackTone('success');
      setFeedbackMessage('ワークアウトを保存済みメニューに追加しました。');
    } catch (error) {
      setFeedbackTone('error');
      setFeedbackMessage(error instanceof Error ? error.message : 'ワークアウト保存に失敗しました。');
    } finally {
      setIsSavingOtherWorkout(false);
    }
  }

  return {
    formValues,
    otherWorkoutValues,
    menus,
    todayLogs,
    todayBurnedKcal,
    feedbackMessage,
    feedbackTone,
    activeMenuId,
    activeLogId,
    isLoading: isMenusLoading || isLogsLoading,
    isSaving,
    isSavingOtherWorkout,
    workoutAiLimit,
    handleValueChange,
    handleOtherWorkoutValueChange,
    handleExerciseValueChange,
    handleAddExercise,
    handleRemoveExercise,
    handleCreateMenu,
    handleCreateMenuLog,
    handleDeleteMenu,
    handleLogMenu,
    handleDeleteLog,
    handleCreateOtherWorkoutLog,
    handleSaveOtherWorkoutMenu,
  };
}
