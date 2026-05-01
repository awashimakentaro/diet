/* 【責務】
 * Foods の食品ライブラリエントリを検索語で絞り込む。
 */

import type { WebLibraryEntry } from '@/domain/web-diet-schema';

export type FoodLibraryEntryWithAddedAt = WebLibraryEntry & { addedAt: string };

function includesKeyword(entry: WebLibraryEntry, keyword: string): boolean {
  const loweredKeyword = keyword.toLowerCase();

  if (entry.name.toLowerCase().includes(loweredKeyword)) {
    return true;
  }

  if (entry.description.toLowerCase().includes(loweredKeyword)) {
    return true;
  }

  if (entry.tags.some((tag) => tag.toLowerCase().includes(loweredKeyword))) {
    return true;
  }

  return entry.items.some((item) => item.name.toLowerCase().includes(loweredKeyword));
}

export function filterFoodLibraryEntries(
  entries: FoodLibraryEntryWithAddedAt[],
  searchTerm: string,
): FoodLibraryEntryWithAddedAt[] {
  const keyword = searchTerm.trim().toLowerCase();

  if (keyword.length === 0) {
    return entries;
  }

  return entries.filter((entry) => includesKeyword(entry, keyword));
}
