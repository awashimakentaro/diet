/* 【責務】
 * Supabase の foods 行を Foods 画面で使う WebLibraryEntry へ変換する。
 */

import type { WebLibraryEntry } from '@/domain/web-diet-schema';

type WebFoodRow = {
  id: string;
  name: string;
  amount: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  created_at: string;
  items: Array<{
    id?: string;
    name?: string;
    amount?: string;
    kcal?: number;
    protein?: number;
    fat?: number;
    carbs?: number;
  }> | null;
};

function toNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function mapWebFoodRow(row: WebFoodRow): WebLibraryEntry & { addedAt: string } {
  const normalizedItems = (row.items ?? []).map((item, index) => ({
    id: item.id ?? `${row.id}-item-${index + 1}`,
    name: item.name ?? '名称未設定',
    amount: item.amount ?? '1人前',
    kcal: toNumber(item.kcal),
    protein: toNumber(item.protein),
    fat: toNumber(item.fat),
    carbs: toNumber(item.carbs),
  }));

  return {
    id: row.id,
    name: row.name,
    description: `${normalizedItems.length}品の再利用カード`,
    amount: row.amount,
    tags: ['history'],
    totals: {
      kcal: toNumber(row.calories),
      protein: toNumber(row.protein),
      fat: toNumber(row.fat),
      carbs: toNumber(row.carbs),
    },
    items: normalizedItems,
    addedAt: new Date(row.created_at).toLocaleDateString('ja-JP'),
  };
}
