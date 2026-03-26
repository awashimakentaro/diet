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

import { deleteFoodLibraryEntry } from './delete-food-library-entry';
import { listFoodLibraryEntries } from './list-food-library-entries';

export type UseFoodsScreenResult = {
  visibleEntries: Array<WebLibraryEntry & { addedAt: string }>;
  searchTerm: string;
  feedbackMessage: string | null;
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

  function handleReuseEntry(entryId: string): void {
    const targetEntry = (data ?? []).find((entry) => entry.id === entryId);

    if (!targetEntry) {
      return;
    }

    setFeedbackMessage(`「${targetEntry.name}」を今日の記録候補にしました。`);
  }

  return {
    visibleEntries,
    searchTerm,
    feedbackMessage,
    headerCount: visibleEntries.length,
    handleSearchChange,
    handleAddFood,
    handleDeleteEntry,
    handleReuseEntry,
  };
}
