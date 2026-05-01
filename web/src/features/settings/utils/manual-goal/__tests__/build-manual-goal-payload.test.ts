/* 【責務】
 * buildManualGoalPayload の振る舞いを検証する。
 */

import { describe, expect, it } from 'vitest';

import { buildManualGoalPayload } from '../build-manual-goal-payload';

describe('buildManualGoalPayload', () => {
  it('手動目標 payload を構築する', () => {
    expect(
      buildManualGoalPayload({
        kcal: '1800',
        protein: '100',
        fat: '50',
        carbs: '220',
      }),
    ).toEqual({
      ok: true,
      payload: {
        kcal: 1800,
        protein: 100,
        fat: 50,
        carbs: 220,
      },
    });
  });

  it('空値や不正値があれば error を返す', () => {
    expect(
      buildManualGoalPayload({
        kcal: '',
        protein: '100',
        fat: '50',
        carbs: 'abc',
      }),
    ).toEqual({
      ok: false,
      error: '目標値はすべて数値で入力してください。',
    });
  });
});
