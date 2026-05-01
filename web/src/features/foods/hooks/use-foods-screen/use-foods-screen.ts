'use client';

/* 【責務】
 * Foods 画面で使う一覧・編集・操作 hook を合成する。
 */

import type { FieldArrayWithId, UseFormReturn } from 'react-hook-form';

import type { MealFormValues } from '@/features/shared/meal-editor/schemas';

import { useFoodEntryActions, type FoodFeedbackTone } from '../use-food-entry-actions';
import { useFoodEntryEditor } from '../use-food-entry-editor';
import { useFoodLibraryList } from '../use-food-library-list';
import type { FoodLibraryEntryWithAddedAt } from '../../utils/filter-food-library-entries';

export type UseFoodsScreenResult = {
  visibleEntries: FoodLibraryEntryWithAddedAt[];
  searchTerm: string;
  feedbackMessage: string | null;
  feedbackTone: FoodFeedbackTone;
  savingEntryId: string | null;
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
  headerCount: number;
  handleSearchChange: (value: string) => void;
  handleAddFood: () => void;
  handleOpenEditor: (entryId: string) => void;
  handleCloseEditor: () => void;
  handleAddEditorItem: () => void;
  handleRemoveEditorItem: (index: number) => void;
  handleSaveEditor: () => Promise<void>;
  handleDeleteEntry: (entryId: string) => Promise<void>;
  handleReuseEntry: (entryId: string) => Promise<void>;
  isLoading: boolean;
};

export function useFoodsScreen(): UseFoodsScreenResult {
  const {
    entries,
    visibleEntries,
    searchTerm,
    handleSearchChange,
    reloadEntries,
    isLoading,
  } = useFoodLibraryList();
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

  return {
    visibleEntries,
    searchTerm,
    feedbackMessage: actions.feedbackMessage,
    feedbackTone: actions.feedbackTone,
    savingEntryId: actions.savingEntryId,
    editingEntry: editor.editingEntry,
    editingForm: editor.editingForm,
    editingItemFields: editor.editingItemFields,
    editingDraftTotals: editor.editingDraftTotals,
    isSavingEdit: actions.isSavingEdit,
    headerCount: visibleEntries.length,
    handleSearchChange,
    handleAddFood: actions.handleAddFood,
    handleOpenEditor: editor.handleOpenEditor,
    handleCloseEditor: editor.handleCloseEditor,
    handleAddEditorItem: editor.handleAddEditorItem,
    handleRemoveEditorItem: editor.handleRemoveEditorItem,
    handleSaveEditor,
    handleDeleteEntry: actions.handleDeleteEntry,
    handleReuseEntry: actions.handleReuseEntry,
    isLoading,
  };
}
