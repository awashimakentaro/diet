/* 【責務】
 * filterFoodLibraryEntries の振る舞いを検証する。
 */

import { describe, expect, it } from 'vitest';

import { filterFoodLibraryEntries, type FoodLibraryEntryWithAddedAt } from '../filter-food-library-entries';

const entries: FoodLibraryEntryWithAddedAt[] = [
  {
    id: 'food-1',
    name: '朝食セット',
    description: '2品の再利用カード',
    amount: '1人前',
    tags: ['morning'],
    totals: { kcal: 300, protein: 20, fat: 10, carbs: 30 },
    items: [
      { id: 'item-1', name: '卵', amount: '2個', kcal: 160, protein: 12, fat: 10, carbs: 0 },
    ],
    addedAt: '2026/04/22',
  },
  {
    id: 'food-2',
    name: '夕食セット',
    description: '魚中心',
    amount: '1人前',
    tags: ['dinner'],
    totals: { kcal: 500, protein: 35, fat: 18, carbs: 45 },
    items: [
      { id: 'item-2', name: '鮭', amount: '1切れ', kcal: 200, protein: 25, fat: 8, carbs: 0 },
    ],
    addedAt: '2026/04/22',
  },
];

describe('filterFoodLibraryEntries', () => {
  it('空の検索語なら全件返す', () => {
    expect(filterFoodLibraryEntries(entries, '   ')).toEqual(entries);
  });

  it('カード名で絞り込む', () => {
    expect(filterFoodLibraryEntries(entries, '朝食')).toEqual([entries[0]]);
  });

  it('食品名で絞り込む', () => {
    expect(filterFoodLibraryEntries(entries, '鮭')).toEqual([entries[1]]);
  });

  it('タグで絞り込む', () => {
    expect(filterFoodLibraryEntries(entries, 'DINNER')).toEqual([entries[1]]);
  });
});
