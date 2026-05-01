/* 【責務】
 * buildHistoryMealUpdatePayload の振る舞いを検証する。
 */

import { afterEach, describe, expect, it, vi } from 'vitest';

import { buildHistoryMealUpdatePayload } from '../build-history-meal-update-payload';

describe('buildHistoryMealUpdatePayload', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('履歴更新 payload を構築する', () => {
    vi.stubGlobal('crypto', {
      randomUUID: vi.fn().mockReturnValue('history-uuid-1'),
    });

    const result = buildHistoryMealUpdatePayload({
      mealName: '  昼食  ',
      items: [
        {
          name: ' 鶏むね ',
          amount: ' 100g ',
          kcal: '164.44',
          protein: '31.16',
          fat: '3.64',
          carbs: '0.12',
        },
      ],
    });

    expect(result).toEqual({
      menu_name: '昼食',
      foods: [
        {
          id: 'history-uuid-1',
          name: '鶏むね',
          amount: '100g',
          kcal: 164.4,
          protein: 31.2,
          fat: 3.6,
          carbs: 0.1,
        },
      ],
      total: {
        kcal: 164.4,
        protein: 31.2,
        fat: 3.6,
        carbs: 0.1,
      },
    });
  });

  it('食事名が空なら最初の食品名を使う', () => {
    vi.stubGlobal('crypto', {
      randomUUID: vi.fn().mockReturnValue('history-uuid-1'),
    });

    const result = buildHistoryMealUpdatePayload({
      mealName: '   ',
      items: [
        {
          name: '豆腐',
          amount: '',
          kcal: '80',
          protein: '7',
          fat: '4',
          carbs: '2',
        },
      ],
    });

    expect(result.menu_name).toBe('豆腐');
    expect(result.foods[0]?.amount).toBe('1人前');
  });

  it('有効な食品が無ければ例外を投げる', () => {
    const action = () =>
      buildHistoryMealUpdatePayload({
        mealName: '',
        items: [
          {
            name: '   ',
            amount: '',
            kcal: '0',
            protein: '0',
            fat: '0',
            carbs: '0',
          },
        ],
      });

    expect(action).toThrow('食品カードを1件以上入力してください。');
  });
});
