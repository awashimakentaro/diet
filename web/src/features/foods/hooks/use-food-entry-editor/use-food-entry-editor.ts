'use client';

/* 【責務】
 * Foods 画面の食品ライブラリエントリ編集フォームを管理する。
 */

import { useMemo, useState } from 'react';
import { useFieldArray, useForm, useWatch, type FieldArrayWithId, type UseFormReturn } from 'react-hook-form';

import type { MealFormValues } from '@/features/shared/meal-editor/schemas';
import { formatDateKey } from '@/lib/web-date';

import type { FoodLibraryEntryWithAddedAt } from '../../utils/filter-food-library-entries';
import { createEmptyFoodEntryItem } from '../../utils/create-empty-food-entry-item';

export type UseFoodEntryEditorResult = {
  editingEntry: FoodLibraryEntryWithAddedAt | null;
  editingEntryId: string | null;
  editingForm: UseFormReturn<MealFormValues>;
  editingItemFields: FieldArrayWithId<MealFormValues, 'items', 'id'>[];
  editingDraftTotals: {
    kcal: number;
    protein: number;
    fat: number;
    carbs: number;
  };
  handleOpenEditor: (entryId: string) => void;
  handleCloseEditor: () => void;
  handleAddEditorItem: () => void;
  handleRemoveEditorItem: (index: number) => void;
};

function toNumber(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

type UseFoodEntryEditorParams = {
  entries: FoodLibraryEntryWithAddedAt[];
  onOpen?: () => void;
};

export function useFoodEntryEditor({
  entries,
  onOpen,
}: UseFoodEntryEditorParams): UseFoodEntryEditorResult {
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const editingForm = useForm<MealFormValues>({
    defaultValues: {
      prompt: '',
      recordedDate: formatDateKey(new Date()),
      mealName: '',
      items: [createEmptyFoodEntryItem()],
    },
  });
  const { fields: editingItemFields, append, remove } = useFieldArray({
    control: editingForm.control,
    name: 'items',
  });
  const editingItems = useWatch({
    control: editingForm.control,
    name: 'items',
  });
  const editingEntry = useMemo(() => {
    if (editingEntryId === null) {
      return null;
    }

    return entries.find((entry) => entry.id === editingEntryId) ?? null;
  }, [entries, editingEntryId]);
  const editingDraftTotals = useMemo(() => {
    return (editingItems ?? []).reduce(
      (totals, item) => ({
        kcal: totals.kcal + toNumber(item.kcal),
        protein: totals.protein + toNumber(item.protein),
        fat: totals.fat + toNumber(item.fat),
        carbs: totals.carbs + toNumber(item.carbs),
      }),
      { kcal: 0, protein: 0, fat: 0, carbs: 0 },
    );
  }, [editingItems]);

  function handleOpenEditor(entryId: string): void {
    const targetEntry = entries.find((entry) => entry.id === entryId);

    if (!targetEntry) {
      return;
    }

    editingForm.reset({
      prompt: '',
      recordedDate: formatDateKey(new Date()),
      mealName: targetEntry.name,
      items: targetEntry.items.length > 0
        ? targetEntry.items.map((item) => ({
          name: item.name,
          amount: item.amount,
          kcal: String(item.kcal),
          protein: String(item.protein),
          fat: String(item.fat),
          carbs: String(item.carbs),
        }))
        : [createEmptyFoodEntryItem()],
    });
    setEditingEntryId(entryId);
    onOpen?.();
  }

  function handleCloseEditor(): void {
    setEditingEntryId(null);
  }

  function handleAddEditorItem(): void {
    append(createEmptyFoodEntryItem());
  }

  function handleRemoveEditorItem(index: number): void {
    if (editingItemFields.length <= 1) {
      return;
    }

    remove(index);
  }

  return {
    editingEntry,
    editingEntryId,
    editingForm,
    editingItemFields,
    editingDraftTotals,
    handleOpenEditor,
    handleCloseEditor,
    handleAddEditorItem,
    handleRemoveEditorItem,
  };
}
