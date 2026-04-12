/* 【責務】
 * Record フォームの初期値を生成する。
 */

import type { RecordFormValues } from '../schemas/record-form-schema';
import { createEmptyRecordItem } from './create-empty-record-item';
import { getTodayDateKey } from './get-today-date-key';

export function createRecordFormDefaultValues(): RecordFormValues {
  return {
    prompt: '',
    recordedDate: getTodayDateKey(),
    mealName: '',
    items: [createEmptyRecordItem()],
  };
}
