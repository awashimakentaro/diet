/* 【責務】
 * プロフィール由来の消費カロリー計算を検証する。
 */

import { describe, expect, it } from 'vitest';

import { calculateProfileEnergy } from '../calculate-profile-energy';

describe('calculateProfileEnergy', () => {
  it('Mifflin-St Jeor と活動係数から TDEE を計算する', () => {
    expect(calculateProfileEnergy({
      gender: 'male',
      age: 30,
      heightCm: 170,
      currentWeightKg: 60,
      activityLevel: 'moderate',
    })).toEqual({
      bmr: 1518,
      activityKcal: 834,
      tdee: 2352,
    });
  });
});
