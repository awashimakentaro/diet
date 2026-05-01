/* 【責務】
 * buildFoodLibraryEntryUpdatePayload の振る舞いを検証する。
 */

import { afterEach, describe, expect, it, vi } from 'vitest';

import { buildFoodLibraryEntryUpdatePayload } from '../build-food-library-entry-update-payload';

describe('buildFoodLibraryEntryUpdatePayload', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('食品ライブラリ更新 payload を構築する', () => {
    vi.stubGlobal('crypto', {
      randomUUID: vi.fn().mockReturnValue('food-uuid-1'),
    });

    const result = buildFoodLibraryEntryUpdatePayload({
      mealName: '  朝食セット  ',
      items: [
        {
          name: ' 卵 ',
          amount: ' 2個 ',
          kcal: '80.44',
          protein: '6.26',
          fat: '5.14',
          carbs: '0.22',
        },
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

    expect(result).toEqual({
      name: '朝食セット',
      amount: '2個',
      calories: 80.4,
      protein: 6.3,
      fat: 5.1,
      carbs: 0.2,
      items: [
        {
          id: 'food-uuid-1',
          name: '卵',
          amount: '2個',
          kcal: 80.4,
          protein: 6.3,
          fat: 5.1,
          carbs: 0.2,
        },
      ],
    });
  });

  it('食品名が空なら最初の食品名をカード名に使う', () => {
    vi.stubGlobal('crypto', {
      randomUUID: vi.fn().mockReturnValue('food-uuid-1'),
    });

    const result = buildFoodLibraryEntryUpdatePayload({
      mealName: '   ',
      items: [
        {
          name: '鮭',
          amount: '',
          kcal: '100',
          protein: '20',
          fat: '4',
          carbs: '0',
        },
      ],
    });

    expect(result.name).toBe('鮭');
    expect(result.amount).toBe('1人前');
  });

  it('有効な食品が無ければ例外を投げる', () => {
    const action = () =>
      buildFoodLibraryEntryUpdatePayload({
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

    expect(action).toThrow('食品を1件以上入力してください。');
  });
});
