/* 【責務】
 * buildAutoGoalProfileInput の振る舞いを検証する。
 */

import { describe, expect, it } from 'vitest';

import { buildAutoGoalProfileInput } from '../build-auto-goal-profile-input';

describe('buildAutoGoalProfileInput', () => {
  it('自動計算用 input を構築する', () => {
    expect(
      buildAutoGoalProfileInput({
        values: {
          username: 'user_1',
          displayName: '',
          bio: '',
          age: '30',
          heightCm: '160',
          currentWeightKg: '55',
          targetWeightKg: '52',
          targetDays: '60',
        },
        gender: 'female',
        activityLevel: 'high',
      }),
    ).toEqual({
      ok: true,
      input: {
        age: 30,
        heightCm: 160,
        currentWeightKg: 55,
        targetWeightKg: 52,
        gender: 'female',
        activityLevel: 'high',
      },
    });
  });

  it('必要な数値が不正なら error を返す', () => {
    expect(
      buildAutoGoalProfileInput({
        values: {
          username: 'user_1',
          displayName: '',
          bio: '',
          age: '30',
          heightCm: 'abc',
          currentWeightKg: '55',
          targetWeightKg: '52',
          targetDays: '60',
        },
        gender: 'female',
        activityLevel: 'high',
      }),
    ).toEqual({
      ok: false,
      error: '自動計算に必要な数値項目を確認してください。',
    });
  });
});
