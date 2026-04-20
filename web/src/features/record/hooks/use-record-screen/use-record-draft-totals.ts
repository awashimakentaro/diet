/* 【責務】
 * Record 下書き食品一覧から合計栄養値を算出する。
 */

import { useMemo } from 'react';

import type { MealFormValues as RecordFormValues } from '@/features/shared/meal-editor/schemas';

function toNumber(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function useRecordDraftTotals(items: RecordFormValues['items'] | undefined): {
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
} {
  return useMemo(() => {
    return (items ?? []).reduce(
      (totals, item) => ({
        kcal: totals.kcal + toNumber(item.kcal),
        protein: totals.protein + toNumber(item.protein),
        fat: totals.fat + toNumber(item.fat),
        carbs: totals.carbs + toNumber(item.carbs),
      }),
      { kcal: 0, protein: 0, fat: 0, carbs: 0 },
    );
  }, [items]);
}
