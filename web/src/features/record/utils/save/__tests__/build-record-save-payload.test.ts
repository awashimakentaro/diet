/* 【責務】
 * buildRecordSavePayload の振る舞いを検証する。
 */

import { afterEach, describe, expect, it, vi } from 'vitest';

import { buildRecordSavePayload } from '../build-record-save-payload';

describe('buildRecordSavePayload', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('保存用 payload を構築する', () => {
    vi.stubGlobal('crypto', {
      randomUUID: vi.fn().mockReturnValue('uuid-1'),
    });

    const result = buildRecordSavePayload({
      userId: 'user-1',
      values: {
        recordedDate: '2026-04-15',
        mealName: '  朝食  ',
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
      },
      originalText: '  卵2個  ',
      source: 'text',
    });

    expect(result).toEqual({
      user_id: 'user-1',
      original_text: '卵2個',
      foods: [
        {
          id: 'uuid-1',
          name: '卵',
          amount: '2個',
          kcal: 80.4,
          protein: 6.3,
          fat: 5.1,
          carbs: 0.2,
        },
      ],
      total: {
        kcal: 80.4,
        protein: 6.3,
        fat: 5.1,
        carbs: 0.2,
      },
      menu_name: '朝食',
      timestamp: new Date(2026, 3, 15).toISOString(),
      source: 'text',
    });
  });

  it('mealName が空なら最初の食品名を menu_name に使う', () => {
    vi.stubGlobal('crypto', {
      randomUUID: vi.fn().mockReturnValue('uuid-1'),
    });

    const result = buildRecordSavePayload({
      userId: 'user-1',
      values: {
        recordedDate: '2026-04-15',
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
      },
      originalText: '',
      source: 'manual',
    });

    expect(result.menu_name).toBe('鮭');
    expect(result.foods[0]?.amount).toBe('1人前');
  });

  it('有効な食品が無ければ例外を投げる', () => {
    const action = () =>
      buildRecordSavePayload({
        userId: 'user-1',
        values: {
          recordedDate: '2026-04-15',
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
        },
        originalText: '',
        source: 'manual',
      });

    expect(action).toThrowError('食品カードを1件以上入力してください。');
  });
});
