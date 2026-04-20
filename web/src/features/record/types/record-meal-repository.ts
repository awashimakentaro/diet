/* 【責務】
 * Record の食事保存境界を定義する。
 */

import type { MealFormValues as RecordFormValues } from '@/features/shared/meal-editor/schemas';

export type SaveRecordMealParams = {
  values: Pick<RecordFormValues, 'recordedDate' | 'mealName' | 'items'>;
  originalText: string;
  source: 'text' | 'manual';
};

export type RecordMealRepository = {
  saveMeal: (params: SaveRecordMealParams) => Promise<void>;
};
