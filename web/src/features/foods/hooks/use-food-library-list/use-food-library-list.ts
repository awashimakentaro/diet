'use client';

/* 【責務】
 * Foods 画面の食品ライブラリ一覧と検索状態を管理する。
 */

import { useMemo, useState } from 'react';
import useSWR from 'swr';

import type { FoodLibraryEntryWithAddedAt } from '../../utils/filter-food-library-entries';
import { listFoodLibraryEntries } from '../../api/list-food-library-entries';
import { filterFoodLibraryEntries } from '../../utils/filter-food-library-entries';

export type UseFoodLibraryListResult = {
  entries: FoodLibraryEntryWithAddedAt[];
  visibleEntries: FoodLibraryEntryWithAddedAt[];
  searchTerm: string;
  handleSearchChange: (value: string) => void;
  reloadEntries: () => Promise<FoodLibraryEntryWithAddedAt[] | undefined>;
  isLoading: boolean;
};

export function useFoodLibraryList(): UseFoodLibraryListResult {
  const [searchTerm, setSearchTerm] = useState('');
  const { data, mutate, isLoading } = useSWR('/foods/library', listFoodLibraryEntries, {
    fallbackData: [],
  });
  const entries = useMemo(() => data ?? [], [data]);
  const visibleEntries = useMemo(
    () => filterFoodLibraryEntries(entries, searchTerm),
    [entries, searchTerm],
  );

  function handleSearchChange(value: string): void {
    setSearchTerm(value);
  }

  return {
    entries,
    visibleEntries,
    searchTerm,
    handleSearchChange,
    reloadEntries: mutate,
    isLoading,
  };
}
