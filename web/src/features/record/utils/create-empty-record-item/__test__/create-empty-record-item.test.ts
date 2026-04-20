/* 【責務】
 * createEmptyRecordItem の振る舞いを検証する。
 */

import { describe, expect, it } from 'vitest';

import { createEmptyRecordItem } from '../create-empty-record-item';

describe('createEmptyRecordItem', () => {
  it('空の食品入力行を返す', () => {
    const expected = {
      name: '',
      amount: '1人前',
      kcal: '0',
      protein: '0',
      fat: '0',
      carbs: '0',
    };

    const result = createEmptyRecordItem();

    expect(result).toEqual(expected);
  });
});
