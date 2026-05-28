'use client';

/* 【責務】
 * Foods 画面で使う一覧・編集・操作 hook を合成する。
 */

import type { FieldArrayWithId, UseFormReturn } from 'react-hook-form';
import { useMemo, useState } from 'react';
import useSWR from 'swr';

import type { MealFormValues } from '@/features/shared/meal-editor/schemas';
import { deleteWorkoutMenu } from '@/features/workouts/api/delete-workout-menu';
import { getUserProfile } from '@/features/settings/api/get-user-profile';
import { listWorkoutMenus } from '@/features/workouts/api/list-workout-menus';
import { logWorkoutMenu } from '@/features/workouts/api/log-workout-menu';
import { requestWorkoutCalorieEstimate } from '@/features/workouts/api/request-workout-calorie-estimate';
import { updateWorkoutMenu } from '@/features/workouts/api/update-workout-menu';
import type { WorkoutLogEditorValidationState, WorkoutLogEditorValues } from '@/features/workouts/components/workout-log-editor-panel';
import type { WorkoutExerciseFormValues, WorkoutMenu } from '@/features/workouts/types';
import { buildWorkoutEditorExercises } from '@/features/workouts/utils/build-workout-editor-exercises';

import { useFoodEntryActions, type FoodFeedbackTone } from '../use-food-entry-actions';
import { useFoodEntryEditor } from '../use-food-entry-editor';
import { useFoodLibraryList } from '../use-food-library-list';
import type { FoodLibraryEntryWithAddedAt } from '../../utils/filter-food-library-entries';

export type UseFoodsScreenResult = {
  visibleEntries: FoodLibraryEntryWithAddedAt[];
  visibleWorkoutMenus: WorkoutMenu[];
  activeLibraryView: 'foods' | 'workouts';
  searchTerm: string;
  feedbackMessage: string | null;
  feedbackTone: FoodFeedbackTone;
  savingEntryId: string | null;
  activeWorkoutMenuId: string | null;
  activeWorkoutMenuAction: WorkoutMenuAction | null;
  editingWorkoutMenu: WorkoutMenu | null;
  workoutMenuEditorValues: WorkoutLogEditorValues;
  workoutMenuEditorValidation: WorkoutLogEditorValidationState;
  editingEntry: FoodLibraryEntryWithAddedAt | null;
  editingForm: UseFormReturn<MealFormValues>;
  editingItemFields: FieldArrayWithId<MealFormValues, 'items', 'id'>[];
  editingDraftTotals: {
    kcal: number;
    protein: number;
    fat: number;
    carbs: number;
  };
  isSavingEdit: boolean;
  isSavingWorkoutMenuEdit: boolean;
  isEstimatingWorkoutMenuEdit: boolean;
  headerCount: number;
  handleSelectLibraryView: (view: 'foods' | 'workouts') => void;
  handleSearchChange: (value: string) => void;
  handleOpenEditor: (entryId: string) => void;
  handleCloseEditor: () => void;
  handleAddEditorItem: () => void;
  handleRemoveEditorItem: (index: number) => void;
  handleSaveEditor: () => Promise<void>;
  handleDeleteEntry: (entryId: string) => Promise<void>;
  handleReuseEntry: (entryId: string) => Promise<void>;
  handleDeleteWorkoutMenu: (menuId: string) => Promise<void>;
  handleOpenWorkoutMenuEditor: (menu: WorkoutMenu) => void;
  handleCloseWorkoutMenuEditor: () => void;
  handleWorkoutMenuEditorValueChange: (field: keyof WorkoutLogEditorValues, value: string) => void;
  handleWorkoutMenuEditorExerciseChange: (index: number, field: keyof WorkoutExerciseFormValues, value: string) => void;
  handleAddWorkoutMenuEditorExercise: () => void;
  handleRemoveWorkoutMenuEditorExercise: (index: number) => void;
  handleEstimateWorkoutMenuEditor: () => Promise<void>;
  handleSaveWorkoutMenuEditor: () => Promise<void>;
  handleReuseWorkoutMenu: (menu: WorkoutMenu) => Promise<void>;
  isLoading: boolean;
};

const DEFAULT_WORKOUT_MENU_EDITOR_VALUES: WorkoutLogEditorValues = {
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

type WorkoutMenuAction = 'delete' | 'reuse';

const WORKOUT_MENU_BUSY_MIN_MS = 450;

async function waitForWorkoutMenuBusyMinimum(startedAt: number): Promise<void> {
  const remainingMs = WORKOUT_MENU_BUSY_MIN_MS - (Date.now() - startedAt);

  if (remainingMs <= 0) {
    return;
  }

  await new Promise((resolve) => {
    window.setTimeout(resolve, remainingMs);
  });
}

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

export function useFoodsScreen(): UseFoodsScreenResult {
  const [activeLibraryView, setActiveLibraryView] = useState<'foods' | 'workouts'>('foods');
  const [activeWorkoutMenuId, setActiveWorkoutMenuId] = useState<string | null>(null);
  const [activeWorkoutMenuAction, setActiveWorkoutMenuAction] = useState<WorkoutMenuAction | null>(null);
  const [editingWorkoutMenuId, setEditingWorkoutMenuId] = useState<string | null>(null);
  const [workoutMenuEditorValues, setWorkoutMenuEditorValues] = useState<WorkoutLogEditorValues>(DEFAULT_WORKOUT_MENU_EDITOR_VALUES);
  const [workoutMenuEditorValidation, setWorkoutMenuEditorValidation] = useState<WorkoutLogEditorValidationState>({
    invalidKeys: [],
    focusKey: null,
    requestId: 0,
  });
  const [isSavingWorkoutMenuEdit, setIsSavingWorkoutMenuEdit] = useState(false);
  const [isEstimatingWorkoutMenuEdit, setIsEstimatingWorkoutMenuEdit] = useState(false);
  const {
    entries,
    visibleEntries,
    searchTerm,
    handleSearchChange,
    reloadEntries,
    isLoading,
  } = useFoodLibraryList();
  const {
    data: workoutMenus = [],
    isLoading: isWorkoutMenusLoading,
    mutate: reloadWorkoutMenus,
  } = useSWR('/workouts/menus', listWorkoutMenus, { fallbackData: [] });
  const { data: profile = null, isLoading: isProfileLoading } = useSWR('/settings/user-profile', () => getUserProfile(), { fallbackData: null });
  const actions = useFoodEntryActions({ entries, reloadEntries });
  const editor = useFoodEntryEditor({
    entries,
    onOpen: actions.clearFeedback,
  });

  async function handleSaveEditor(): Promise<void> {
    const didSave = await actions.handleSaveEditor(editor.editingEntryId, editor.editingForm);

    if (didSave) {
      editor.handleCloseEditor();
    }
  }

  const visibleWorkoutMenus = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();

    if (normalized.length === 0) {
      return workoutMenus;
    }

    return workoutMenus.filter((menu) => {
      return [
        menu.name,
        menu.note,
        ...menu.exercises.map((exercise) => exercise.exerciseName),
      ].some((value) => value.toLowerCase().includes(normalized));
    });
  }, [searchTerm, workoutMenus]);
  const editingWorkoutMenu = useMemo(() => {
    if (editingWorkoutMenuId === null) {
      return null;
    }

    return workoutMenus.find((menu) => menu.id === editingWorkoutMenuId) ?? null;
  }, [editingWorkoutMenuId, workoutMenus]);

  function handleSelectLibraryView(view: 'foods' | 'workouts'): void {
    setActiveLibraryView(view);
    actions.clearFeedback();
  }

  async function handleDeleteWorkoutMenu(menuId: string): Promise<void> {
    const startedAt = Date.now();

    setActiveWorkoutMenuId(menuId);
    setActiveWorkoutMenuAction('delete');
    actions.clearFeedback();

    try {
      await deleteWorkoutMenu(menuId);
      await reloadWorkoutMenus();
      actions.setFeedback('筋トレメニューを削除しました。', 'info');
    } catch (error) {
      actions.setFeedback(error instanceof Error ? error.message : '筋トレメニューの削除に失敗しました。', 'error');
    } finally {
      await waitForWorkoutMenuBusyMinimum(startedAt);
      setActiveWorkoutMenuId(null);
      setActiveWorkoutMenuAction(null);
    }
  }

  function handleOpenWorkoutMenuEditor(menu: WorkoutMenu): void {
    setEditingWorkoutMenuId(menu.id);
    setWorkoutMenuEditorValues({
      kind: menu.kind,
      name: menu.name,
      durationMinutes: String(menu.durationMinutes),
      intensity: menu.intensity,
      burnedKcal: menu.estimatedBurnedKcal === null ? '' : String(Math.round(menu.estimatedBurnedKcal)),
      note: menu.note,
      exercises: menu.exercises.map((exercise) => ({
        exerciseName: exercise.exerciseName,
        sets: String(exercise.sets),
        reps: String(exercise.reps),
        weightKg: String(exercise.weightKg),
        durationMinutes: String(Math.max(1, Math.round(exercise.durationMinutes / Math.max(1, exercise.sets)))),
      })),
    });
    setWorkoutMenuEditorValidation({ invalidKeys: [], focusKey: null, requestId: 0 });
    actions.clearFeedback();
  }

  function handleCloseWorkoutMenuEditor(): void {
    setEditingWorkoutMenuId(null);
    setWorkoutMenuEditorValues(DEFAULT_WORKOUT_MENU_EDITOR_VALUES);
    setWorkoutMenuEditorValidation({ invalidKeys: [], focusKey: null, requestId: 0 });
  }

  function handleWorkoutMenuEditorValueChange(field: keyof WorkoutLogEditorValues, value: string): void {
    setWorkoutMenuEditorValidation({ invalidKeys: [], focusKey: null, requestId: 0 });
    setWorkoutMenuEditorValues((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleWorkoutMenuEditorExerciseChange(
    index: number,
    field: keyof WorkoutExerciseFormValues,
    value: string,
  ): void {
    setWorkoutMenuEditorValidation({ invalidKeys: [], focusKey: null, requestId: 0 });
    setWorkoutMenuEditorValues((current) => ({
      ...current,
      exercises: current.exercises.map((exercise, exerciseIndex) => (
        exerciseIndex === index ? { ...exercise, [field]: value } : exercise
      )),
    }));
  }

  function handleAddWorkoutMenuEditorExercise(): void {
    setWorkoutMenuEditorValidation({ invalidKeys: [], focusKey: null, requestId: 0 });
    setWorkoutMenuEditorValues((current) => ({
      ...current,
      exercises: current.exercises.concat({ ...EMPTY_WORKOUT_EXERCISE }),
    }));
  }

  function handleRemoveWorkoutMenuEditorExercise(index: number): void {
    setWorkoutMenuEditorValidation({ invalidKeys: [], focusKey: null, requestId: 0 });
    setWorkoutMenuEditorValues((current) => {
      if (current.exercises.length <= 1) {
        return current;
      }

      return {
        ...current,
        exercises: current.exercises.filter((_, exerciseIndex) => exerciseIndex !== index),
      };
    });
  }

  async function handleEstimateWorkoutMenuEditor(): Promise<void> {
    const currentWeightKg = Number(profile?.current_weight_kg);
    const age = Number(profile?.age);
    const heightCm = Number(profile?.height_cm);
    const exercises = buildWorkoutEditorExercises(workoutMenuEditorValues.exercises);

    if (
      workoutMenuEditorValues.name.trim().length === 0
      || exercises === null
      || !Number.isFinite(currentWeightKg)
      || currentWeightKg <= 0
    ) {
      actions.setFeedback('ワークアウト名、体重、種目を確認してください。', 'error');
      return;
    }

    setIsEstimatingWorkoutMenuEdit(true);

    try {
      const estimate = await requestWorkoutCalorieEstimate({
        menuName: workoutMenuEditorValues.name.trim(),
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

      setWorkoutMenuEditorValues((current) => ({
        ...current,
        burnedKcal: String(Math.round(estimate.burnedKcal)),
      }));
      actions.setFeedback('AIで消費カロリーを再計算しました。', 'info');
    } catch (error) {
      actions.setFeedback(error instanceof Error ? error.message : 'AI推定に失敗しました。', 'error');
    } finally {
      setIsEstimatingWorkoutMenuEdit(false);
    }
  }

  async function handleSaveWorkoutMenuEditor(): Promise<void> {
    if (editingWorkoutMenu === null) {
      return;
    }

    const invalidKeys = buildWorkoutEditorInvalidKeys(workoutMenuEditorValues);

    if (invalidKeys.length > 0) {
      setWorkoutMenuEditorValidation((current) => ({
        invalidKeys,
        focusKey: invalidKeys[0] ?? null,
        requestId: current.requestId + 1,
      }));
      actions.setFeedback('入力が足りない項目があります。', 'error');
      return;
    }

    const burnedKcal = Number(workoutMenuEditorValues.burnedKcal);
    const exercises = workoutMenuEditorValues.kind === 'strength'
      ? buildWorkoutEditorExercises(workoutMenuEditorValues.exercises)
      : [
        {
          exerciseName: workoutMenuEditorValues.name.trim(),
          sets: 1,
          reps: 1,
          weightKg: 0,
          durationMinutes: Number(workoutMenuEditorValues.durationMinutes),
        },
      ];
    const durationMinutes = exercises === null
      ? Number(workoutMenuEditorValues.durationMinutes)
      : exercises.reduce((sum, exercise) => sum + exercise.durationMinutes, 0);

    if (
      workoutMenuEditorValues.name.trim().length === 0
      || exercises === null
      || !Number.isFinite(durationMinutes)
      || durationMinutes <= 0
      || !Number.isFinite(burnedKcal)
      || burnedKcal < 0
    ) {
      actions.setFeedback('ワークアウト名、時間、消費カロリーを確認してください。', 'error');
      return;
    }

    setIsSavingWorkoutMenuEdit(true);

    try {
      await updateWorkoutMenu({
        menuId: editingWorkoutMenu.id,
        kind: workoutMenuEditorValues.kind,
        name: workoutMenuEditorValues.name.trim(),
        durationMinutes,
        intensity: workoutMenuEditorValues.intensity,
        estimatedBurnedKcal: burnedKcal,
        note: workoutMenuEditorValues.note.trim(),
        exercises,
      });
      await reloadWorkoutMenus();
      actions.setFeedback('筋トレメニューを更新しました。', 'info');
      handleCloseWorkoutMenuEditor();
    } catch (error) {
      actions.setFeedback(error instanceof Error ? error.message : '筋トレメニューの更新に失敗しました。', 'error');
    } finally {
      setIsSavingWorkoutMenuEdit(false);
    }
  }

  async function handleReuseWorkoutMenu(menu: WorkoutMenu): Promise<void> {
    const startedAt = Date.now();

    setActiveWorkoutMenuId(menu.id);
    setActiveWorkoutMenuAction('reuse');
    actions.clearFeedback();

    try {
      await logWorkoutMenu(menu);
      actions.setFeedback('今日のワークアウトとして記録しました。', 'info');
    } catch (error) {
      actions.setFeedback(error instanceof Error ? error.message : 'ワークアウトの記録に失敗しました。', 'error');
    } finally {
      await waitForWorkoutMenuBusyMinimum(startedAt);
      setActiveWorkoutMenuId(null);
      setActiveWorkoutMenuAction(null);
    }
  }

  return {
    visibleEntries,
    visibleWorkoutMenus,
    activeLibraryView,
    searchTerm,
    feedbackMessage: actions.feedbackMessage,
    feedbackTone: actions.feedbackTone,
    savingEntryId: actions.savingEntryId,
    activeWorkoutMenuId,
    activeWorkoutMenuAction,
    editingWorkoutMenu,
    workoutMenuEditorValues,
    workoutMenuEditorValidation,
    editingEntry: editor.editingEntry,
    editingForm: editor.editingForm,
    editingItemFields: editor.editingItemFields,
    editingDraftTotals: editor.editingDraftTotals,
    isSavingEdit: actions.isSavingEdit,
    isSavingWorkoutMenuEdit,
    isEstimatingWorkoutMenuEdit,
    headerCount: activeLibraryView === 'foods' ? visibleEntries.length : visibleWorkoutMenus.length,
    handleSelectLibraryView,
    handleSearchChange,
    handleOpenEditor: editor.handleOpenEditor,
    handleCloseEditor: editor.handleCloseEditor,
    handleAddEditorItem: editor.handleAddEditorItem,
    handleRemoveEditorItem: editor.handleRemoveEditorItem,
    handleSaveEditor,
    handleDeleteEntry: actions.handleDeleteEntry,
    handleReuseEntry: actions.handleReuseEntry,
    handleDeleteWorkoutMenu,
    handleOpenWorkoutMenuEditor,
    handleCloseWorkoutMenuEditor,
    handleWorkoutMenuEditorValueChange,
    handleWorkoutMenuEditorExerciseChange,
    handleAddWorkoutMenuEditorExercise,
    handleRemoveWorkoutMenuEditorExercise,
    handleEstimateWorkoutMenuEditor,
    handleSaveWorkoutMenuEditor,
    handleReuseWorkoutMenu,
    isLoading: isLoading || isWorkoutMenusLoading || isProfileLoading,
  };
}
