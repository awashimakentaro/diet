'use client';

/**
 * web/src/features/foods/use-foods-screen.ts
 *
 * 【責務】
 * Foods 画面の検索・一覧操作 state をまとめる。
 *
 * 【使用されるエージェント / 処理フロー】
 * - web/src/app/app/foods/_components/foods-page-screen.tsx から呼ばれる。
 * - foods テーブルの取得結果を検索条件で絞り込み、表示用に整形する。
 *
 * 【やらないこと】
 * - JSX 描画
 *
 * 【他ファイルとの関係】
 * - list-food-library-entries.ts と delete-food-library-entry.ts を利用する。
 * - components 配下へ state とハンドラを渡す。
 */

import { useMemo, useState } from 'react';
import { useFieldArray, useForm, type FieldArrayWithId, type UseFormReturn } from 'react-hook-form';
import useSWR from 'swr';

import type { WebLibraryEntry } from '@/domain/web-diet-schema';
import { formatDateKey } from '@/lib/web-date';
import type { RecordFormValues } from '@/features/record/record-form-schema';

import { createMealFromLibraryEntry } from './create-meal-from-library-entry';
import { deleteFoodLibraryEntry } from './delete-food-library-entry';
import { listFoodLibraryEntries } from './list-food-library-entries';
import { updateFoodLibraryEntry } from './update-food-library-entry';

export type UseFoodsScreenResult = {
  visibleEntries: Array<WebLibraryEntry & { addedAt: string }>;
  searchTerm: string;
  feedbackMessage: string | null;
  feedbackTone: 'info' | 'error';
  savingEntryId: string | null;
  editingEntry: WebLibraryEntry | null;
  editingForm: UseFormReturn<RecordFormValues>;
  editingItemFields: FieldArrayWithId<RecordFormValues, 'items', 'id'>[];
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
  handleDeleteEntry: (entryId: string) => void;
  handleReuseEntry: (entryId: string) => void;
  isLoading: boolean;
};

function createEmptyItem() {
  return {
    name: '',
    amount: '1人前',
    kcal: '0',
    protein: '0',
    fat: '0',
    carbs: '0',
  };
}

function toNumber(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function includesKeyword(entry: WebLibraryEntry, keyword: string): boolean {
  const lowered = keyword.toLowerCase();

  if (entry.name.toLowerCase().includes(lowered)) {
    return true;
  }

  if (entry.description.toLowerCase().includes(lowered)) {
    return true;
  }

  if (entry.tags.some((tag) => tag.toLowerCase().includes(lowered))) {
    return true;
  }

  return entry.items.some((item) => item.name.toLowerCase().includes(lowered));
}

export function useFoodsScreen(): UseFoodsScreenResult {
  const [searchTerm, setSearchTerm] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [feedbackTone, setFeedbackTone] = useState<'info' | 'error'>('info');
  const [savingEntryId, setSavingEntryId] = useState<string | null>(null);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const { data, mutate, isLoading } = useSWR('/foods/library', listFoodLibraryEntries, {
    fallbackData: [],
  });
  const editingForm = useForm<RecordFormValues>({
    defaultValues: {
      prompt: '',
      recordedDate: formatDateKey(new Date()),
      mealName: '',
      items: [createEmptyItem()],
    },
  });
  const { fields: editingItemFields, append, remove } = useFieldArray({
    control: editingForm.control,
    name: 'items',
  });

  const visibleEntries = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    const entries = data ?? [];

    return entries.filter((entry) => {
      if (keyword.length === 0) {
        return true;
      }

      return includesKeyword(entry, keyword);
    });
  }, [data, searchTerm]);
  const editingEntry = useMemo(() => {
    if (editingEntryId === null) {
      return null;
    }

    return (data ?? []).find((entry) => entry.id === editingEntryId) ?? null;
  }, [data, editingEntryId]);
  const editingItems = editingForm.watch('items');
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

  function handleSearchChange(value: string): void {
    setSearchTerm(value);
  }

  function handleAddFood(): void {
    setFeedbackMessage('食品追加フォームの接続は次に行います。');
    setFeedbackTone('info');
  }

  function handleOpenEditor(entryId: string): void {
    const targetEntry = (data ?? []).find((entry) => entry.id === entryId);

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
        : [createEmptyItem()],
    });
    setEditingEntryId(entryId);
    setFeedbackMessage(null);
    setFeedbackTone('info');
  }

  function handleCloseEditor(): void {
    setEditingEntryId(null);
  }

  function handleAddEditorItem(): void {
    append(createEmptyItem());
  }

  function handleRemoveEditorItem(index: number): void {
    if (editingItemFields.length <= 1) {
      return;
    }

    remove(index);
  }

  async function handleSaveEditor(): Promise<void> {
    if (!editingEntryId) {
      return;
    }

    setIsSavingEdit(true);

    try {
      const values = editingForm.getValues();
      await updateFoodLibraryEntry({
        entryId: editingEntryId,
        mealName: values.mealName,
        items: values.items,
      });
      await mutate();
      setFeedbackMessage('食品カードを更新しました。');
      setFeedbackTone('info');
      setEditingEntryId(null);
    } catch (error) {
      setFeedbackMessage(
        error instanceof Error
          ? error.message
          : '食品カードを更新できませんでした。',
      );
      setFeedbackTone('error');
    } finally {
      setIsSavingEdit(false);
    }
  }

  async function handleDeleteEntry(entryId: string): Promise<void> {
    try {
      await deleteFoodLibraryEntry(entryId);
      await mutate();
      setFeedbackMessage('食品カードを削除しました。');
      setFeedbackTone('info');
    } catch (error) {
      setFeedbackMessage(
        error instanceof Error
          ? error.message
          : '食品カードを削除できませんでした。',
      );
      setFeedbackTone('error');
    }
  }

  async function handleReuseEntry(entryId: string): Promise<void> {
    const targetEntry = (data ?? []).find((entry) => entry.id === entryId);

    if (!targetEntry) {
      return;
    }

    try {
      setSavingEntryId(entryId);
      await createMealFromLibraryEntry(targetEntry);
      setFeedbackMessage(`「${targetEntry.name}」を履歴へ追加しました。`);
      setFeedbackTone('info');
    } catch (error) {
      setFeedbackMessage(
        error instanceof Error
          ? error.message
          : '履歴へ追加できませんでした。',
      );
      setFeedbackTone('error');
    } finally {
      setSavingEntryId(null);
    }
  }

  return {
    visibleEntries,
    searchTerm,
    feedbackMessage,
    feedbackTone,
    savingEntryId,
    editingEntry,
    editingForm,
    editingItemFields,
    editingDraftTotals,
    isSavingEdit,
    headerCount: visibleEntries.length,
    handleSearchChange,
    handleAddFood,
    handleOpenEditor,
    handleCloseEditor,
    handleAddEditorItem,
    handleRemoveEditorItem,
    handleSaveEditor,
    handleDeleteEntry,
    handleReuseEntry,
    isLoading,
  };
}
