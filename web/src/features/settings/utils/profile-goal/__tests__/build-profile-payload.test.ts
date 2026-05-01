/* 【責務】
 * buildProfilePayload の振る舞いを検証する。
 */

import { describe, expect, it } from 'vitest';

import { buildProfilePayload } from '../build-profile-payload';

describe('buildProfilePayload', () => {
  it('プロフィール保存 payload を構築する', () => {
    expect(
      buildProfilePayload({
        values: {
          username: 'user_1',
          displayName: 'User',
          bio: 'bio',
          age: '30',
          heightCm: '160',
          currentWeightKg: '55.5',
          targetWeightKg: '52',
          targetDays: '60',
        },
        gender: 'female',
        activityLevel: 'moderate',
      }),
    ).toEqual({
      ok: true,
      payload: {
        username: 'user_1',
        displayName: 'User',
        bio: 'bio',
        gender: 'female',
        age: 30,
        heightCm: 160,
        currentWeightKg: 55.5,
        targetWeightKg: 52,
        targetDays: 60,
        activityLevel: 'moderate',
      },
    });
  });

  it('数値項目が不正なら error を返す', () => {
    expect(
      buildProfilePayload({
        values: {
          username: 'user_1',
          displayName: '',
          bio: '',
          age: 'abc',
          heightCm: '160',
          currentWeightKg: '55',
          targetWeightKg: '52',
          targetDays: '60',
        },
        gender: 'female',
        activityLevel: 'moderate',
      }),
    ).toEqual({
      ok: false,
      error: 'プロフィールの数値項目を確認してください。',
    });
  });
});
