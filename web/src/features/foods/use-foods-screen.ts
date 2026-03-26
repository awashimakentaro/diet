'use client';

/**
 * web/src/features/foods/use-foods-screen.ts
 *
 * 【責務】
 * Foods 画面の検索・一覧操作 state をまとめる。
 *
 * 【使用されるエージェント / 処理フロー】
 * - foods-screen.tsx から呼ばれる。
 * - foods テーブルの取得結果を検索条件で絞り込み、表示用に整形する。
 *
 * 【やらないこと】
 * - JSX 描画
 *
 * 【他ファイルとの関係】
 * - list-food-library-entries.ts と delete-food-library-entry.ts を利用する。
 * - components 配下へ state とハンドラを渡す。
 */

import useSWR from 'swr';
import { useMemo, useState } from 'react';

import type { WebLibraryEntry } from '@/domain/web-diet-schema';

import { createMealFromLibraryEntry } from './create-meal-from-library-entry';
import { deleteFoodLibraryEntry } from './delete-food-library-entry';
import { listFoodLibraryEntries } from './list-food-library-entries';

export type UseFoodsScreenResult = {
  visibleEntries: Array<WebLibraryEntry & { addedAt: string }>;
  searchTerm: string;
  feedbackMessage: string | null;
  savingEntryId: string | null;
  headerCount: number;
  handleSearchChange: (value: string) => void;
  handleAddFood: () => void;
  handleDeleteEntry: (entryId: string) => void;
  handleReuseEntry: (entryId: string) => void;
};

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
  const [savingEntryId, setSavingEntryId] = useState<string | null>(null);
  const { data, mutate } = useSWR('/foods/library', listFoodLibraryEntries, {
    fallbackData: [],
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

  function handleSearchChange(value: string): void {
    setSearchTerm(value);
  }

  function handleAddFood(): void {
    setFeedbackMessage('食品追加フォームの接続は次に行います。');
  }

  async function handleDeleteEntry(entryId: string): Promise<void> {
    try {
      await deleteFoodLibraryEntry(entryId);
      await mutate();
      setFeedbackMessage('食品カードを削除しました。');
    } catch (error) {
      setFeedbackMessage(
        error instanceof Error
          ? error.message
          : '食品カードを削除できませんでした。',
      );
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
    } catch (error) {
      setFeedbackMessage(
        error instanceof Error
          ? error.message
          : '履歴へ追加できませんでした。',
      );
    } finally {
      setSavingEntryId(null);
    }
  }

  return {
    visibleEntries,
    searchTerm,
    feedbackMessage,
    savingEntryId,
    headerCount: visibleEntries.length,
    handleSearchChange,
    handleAddFood,
    handleDeleteEntry,
    handleReuseEntry,
  };
}
