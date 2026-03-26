'use client';

/**
 * web/src/features/foods/use-foods-screen.ts
 *
 * 【責務】
 * Foods 画面の検索・ローカル一覧操作 state をまとめる。
 *
 * 【使用されるエージェント / 処理フロー】
 * - foods-screen.tsx から呼ばれる。
 * - mockLibraryEntries をベースに表示用データを整形する。
 *
 * 【やらないこと】
 * - API 通信
 * - 永続化
 * - JSX 描画
 *
 * 【他ファイルとの関係】
 * - web/src/data/mock-diet-data.ts の食品ライブラリデータを利用する。
 * - components 配下へ state とハンドラを渡す。
 */

import { useMemo, useState } from 'react';

import { mockLibraryEntries } from '@/data/mock-diet-data';
import type { WebLibraryEntry } from '@/domain/web-diet-schema';

const MOCK_ADDED_AT: Record<string, string> = {
  'library-1': '2026/01/27',
  'library-2': '2026/01/23',
};

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
  const [hiddenEntryIds, setHiddenEntryIds] = useState<string[]>([]);

  const visibleEntries = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return mockLibraryEntries
      .filter((entry) => hiddenEntryIds.includes(entry.id) === false)
      .filter((entry) => {
        if (keyword.length === 0) {
          return true;
        }

        return includesKeyword(entry, keyword);
      })
      .map((entry) => ({
        ...entry,
        addedAt: MOCK_ADDED_AT[entry.id] ?? '2026/01/27',
      }));
  }, [hiddenEntryIds, searchTerm]);

  function handleSearchChange(value: string): void {
    setSearchTerm(value);
  }

  function handleAddFood(): void {
    setFeedbackMessage('食品追加フォームの接続は次に行います。');
  }

  function handleDeleteEntry(entryId: string): void {
    setHiddenEntryIds((current) => current.concat(entryId));
    setFeedbackMessage('食品カードをローカルで非表示にしました。');
  }

  function handleReuseEntry(entryId: string): void {
    const targetEntry = mockLibraryEntries.find((entry) => entry.id === entryId);

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
