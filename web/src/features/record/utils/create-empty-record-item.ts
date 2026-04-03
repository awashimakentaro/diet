/* 【責務】
 * Record 画面の空の食品入力行を生成する。
 */

import type { RecordFoodItemValues } from '../schemas/record-form-schema';

export function createEmptyRecordItem(): RecordFoodItemValues {
  return {
    name: '',
    amount: '1人前',
    kcal: '0',
    protein: '0',
    fat: '0',
    carbs: '0',
  };
}
