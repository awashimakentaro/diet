/* 【責務】
 * createRecordFormDefaultValues の振る舞いを検証する。
 */

import { describe, expect, it, vi } from 'vitest';

import { createRecordFormDefaultValues } from '../create-record-form-default-values';

vi.mock('../../get-today-date-key', () => ({
  getTodayDateKey: () => '2026-04-20',
}));

describe('createRecordFormDefaultValues', () => {
  it('記録フォームの初期値を返す', () => {
    const expected = {
      prompt: '',
      recordedDate: '2026-04-20',
      mealName: '',
      items: [
        {
          name: '',
          amount: '1人前',
          kcal: '0',
          protein: '0',
          fat: '0',
          carbs: '0',
        },
      ],
    };

    const result = createRecordFormDefaultValues();

    expect(result).toEqual(expected);
  });
});
