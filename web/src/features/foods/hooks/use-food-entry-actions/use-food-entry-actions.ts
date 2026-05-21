'use client';

/* 【責務】
 * Foods 画面の食品ライブラリエントリ操作を管理する。
 */

import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';

import type { MealFormValues } from '@/features/shared/meal-editor/schemas';

import { createMealFromLibraryEntry } from '../../api/create-meal-from-library-entry';
import { deleteFoodLibraryEntry } from '../../api/delete-food-library-entry';
import { updateFoodLibraryEntry } from '../../api/update-food-library-entry';
import type { FoodLibraryEntryWithAddedAt } from '../../utils/filter-food-library-entries';
import {
  buildFoodDeleteErrorFeedback,
  buildFoodDeleteSuccessFeedback,
  buildFoodReuseErrorFeedback,
  buildFoodReuseSuccessFeedback,
  buildFoodUpdateErrorFeedback,
  buildFoodUpdateSuccessFeedback,
} from '../../utils/build-foods-feedback';

export type FoodFeedbackTone = 'info' | 'error';

export type UseFoodEntryActionsResult = {
  feedbackMessage: string | null;
  feedbackTone: FoodFeedbackTone;
  savingEntryId: string | null;
  isSavingEdit: boolean;
  clearFeedback: () => void;
  setFeedback: (message: string, tone: FoodFeedbackTone) => void;
  handleSaveEditor: (entryId: string | null, form: UseFormReturn<MealFormValues>) => Promise<boolean>;
  handleDeleteEntry: (entryId: string) => Promise<void>;
  handleReuseEntry: (entryId: string) => Promise<void>;
};

type UseFoodEntryActionsParams = {
  entries: FoodLibraryEntryWithAddedAt[];
  reloadEntries: () => Promise<FoodLibraryEntryWithAddedAt[] | undefined>;
};

export function useFoodEntryActions({
  entries,
  reloadEntries,
}: UseFoodEntryActionsParams): UseFoodEntryActionsResult {
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [feedbackTone, setFeedbackTone] = useState<FoodFeedbackTone>('info');
  const [savingEntryId, setSavingEntryId] = useState<string | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  function setFeedback(message: string, tone: FoodFeedbackTone): void {
    setFeedbackMessage(message);
    setFeedbackTone(tone);
  }

  function clearFeedback(): void {
    setFeedbackMessage(null);
    setFeedbackTone('info');
  }

  async function handleSaveEditor(
    entryId: string | null,
    form: UseFormReturn<MealFormValues>,
  ): Promise<boolean> {
    if (!entryId) {
      return false;
    }

    setIsSavingEdit(true);

    try {
      const values = form.getValues();
      await updateFoodLibraryEntry({
        entryId,
        mealName: values.mealName,
        items: values.items,
      });
      await reloadEntries();
      setFeedback(buildFoodUpdateSuccessFeedback(), 'info');
      return true;
    } catch (error) {
      setFeedback(buildFoodUpdateErrorFeedback(error), 'error');
      return false;
    } finally {
      setIsSavingEdit(false);
    }
  }

  async function handleDeleteEntry(entryId: string): Promise<void> {
    try {
      await deleteFoodLibraryEntry(entryId);
      await reloadEntries();
      setFeedback(buildFoodDeleteSuccessFeedback(), 'info');
    } catch (error) {
      setFeedback(buildFoodDeleteErrorFeedback(error), 'error');
    }
  }

  async function handleReuseEntry(entryId: string): Promise<void> {
    const targetEntry = entries.find((entry) => entry.id === entryId);

    if (!targetEntry) {
      return;
    }

    try {
      setSavingEntryId(entryId);
      await createMealFromLibraryEntry(targetEntry);
      setFeedback(buildFoodReuseSuccessFeedback(targetEntry), 'info');
    } catch (error) {
      setFeedback(buildFoodReuseErrorFeedback(error), 'error');
    } finally {
      setSavingEntryId(null);
    }
  }

  return {
    feedbackMessage,
    feedbackTone,
    savingEntryId,
    isSavingEdit,
    clearFeedback,
    setFeedback,
    handleSaveEditor,
    handleDeleteEntry,
    handleReuseEntry,
  };
}
