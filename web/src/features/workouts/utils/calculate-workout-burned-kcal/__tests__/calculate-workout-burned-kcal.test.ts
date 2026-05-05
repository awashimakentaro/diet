/* 【責務】
 * 筋トレ消費カロリー計算を検証する。
 */

import { describe, expect, it } from 'vitest';

import { calculateWorkoutBurnedKcal } from '../calculate-workout-burned-kcal';

describe('calculateWorkoutBurnedKcal', () => {
  it('METs・体重・時間から消費カロリーを計算する', () => {
    expect(calculateWorkoutBurnedKcal({
      intensity: 'normal',
      weightKg: 60,
      durationMinutes: 30,
    })).toBe(150);
  });
});
