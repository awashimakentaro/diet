'use client';

/* 【責務】
 * Foods 画面で使う一覧・編集・操作 hook を合成する。
 */

import type { FieldArrayWithId, UseFormReturn } from 'react-hook-form';
import { useMemo, useState } from 'react';
import useSWR from 'swr';

import type { MealFormValues } from '@/features/shared/meal-editor/schemas';
import { deleteWorkoutMenu } from '@/features/workouts/api/delete-workout-menu';
import { listWorkoutMenus } from '@/features/workouts/api/list-workout-menus';
import { logWorkoutMenu } from '@/features/workouts/api/log-workout-menu';
import { updateWorkoutMenu } from '@/features/workouts/api/update-workout-menu';
import type { WorkoutLogEditorValues } from '@/features/workouts/components/workout-log-editor-panel';
import type { WorkoutMenu } from '@/features/workouts/types';

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
  editingWorkoutMenu: WorkoutMenu | null;
  workoutMenuEditorValues: WorkoutLogEditorValues;
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
};

export function useFoodsScreen(): UseFoodsScreenResult {
  const [activeLibraryView, setActiveLibraryView] = useState<'foods' | 'workouts'>('foods');
  const [activeWorkoutMenuId, setActiveWorkoutMenuId] = useState<string | null>(null);
  const [editingWorkoutMenuId, setEditingWorkoutMenuId] = useState<string | null>(null);
  const [workoutMenuEditorValues, setWorkoutMenuEditorValues] = useState<WorkoutLogEditorValues>(DEFAULT_WORKOUT_MENU_EDITOR_VALUES);
  const [isSavingWorkoutMenuEdit, setIsSavingWorkoutMenuEdit] = useState(false);
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
    setActiveWorkoutMenuId(menuId);
    actions.clearFeedback();

    try {
      await deleteWorkoutMenu(menuId);
      await reloadWorkoutMenus();
      actions.setFeedback('筋トレメニューを削除しました。', 'info');
    } catch (error) {
      actions.setFeedback(error instanceof Error ? error.message : '筋トレメニューの削除に失敗しました。', 'error');
    } finally {
      setActiveWorkoutMenuId(null);
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
    });
    actions.clearFeedback();
  }

  function handleCloseWorkoutMenuEditor(): void {
    setEditingWorkoutMenuId(null);
    setWorkoutMenuEditorValues(DEFAULT_WORKOUT_MENU_EDITOR_VALUES);
  }

  function handleWorkoutMenuEditorValueChange(field: keyof WorkoutLogEditorValues, value: string): void {
    setWorkoutMenuEditorValues((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSaveWorkoutMenuEditor(): Promise<void> {
    if (editingWorkoutMenu === null) {
      return;
    }

    const durationMinutes = Number(workoutMenuEditorValues.durationMinutes);
    const burnedKcal = Number(workoutMenuEditorValues.burnedKcal);

    if (
      workoutMenuEditorValues.name.trim().length === 0
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
    setActiveWorkoutMenuId(menu.id);
    actions.clearFeedback();

    try {
      await logWorkoutMenu(menu);
      actions.setFeedback('今日のワークアウトとして記録しました。', 'info');
    } catch (error) {
      actions.setFeedback(error instanceof Error ? error.message : 'ワークアウトの記録に失敗しました。', 'error');
    } finally {
      setActiveWorkoutMenuId(null);
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
    editingWorkoutMenu,
    workoutMenuEditorValues,
    editingEntry: editor.editingEntry,
    editingForm: editor.editingForm,
    editingItemFields: editor.editingItemFields,
    editingDraftTotals: editor.editingDraftTotals,
    isSavingEdit: actions.isSavingEdit,
    isSavingWorkoutMenuEdit,
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
    handleSaveWorkoutMenuEditor,
    handleReuseWorkoutMenu,
    isLoading: isLoading || isWorkoutMenusLoading,
  };
}
