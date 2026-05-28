/* 【責務】
 * プロフィールからの目標 kcal / PFC 自動計算を検証する。
 */

import { describe, expect, it } from 'vitest';

import { calculateGoalFromProfile } from '../calculate-goal-from-profile';

describe('calculateGoalFromProfile', () => {
  it('目標体重と達成日数から減量用の摂取目標を計算する', () => {
    expect(calculateGoalFromProfile({
      age: 30,
      heightCm: 170,
      currentWeightKg: 70,
      targetWeightKg: 66,
      targetDays: 80,
      gender: 'male',
      activityLevel: 'moderate',
    })).toEqual({
      kcal: 2122,
      protein: 140,
      fat: 59,
      carbs: 258,
      bmr: 1618,
      estimatedDailyBurnKcal: 2507,
      dailyCalorieAdjustment: -385,
      warning: null,
    });
  });

  it('短すぎる減量目標は最低摂取カロリーに補正する', () => {
    expect(calculateGoalFromProfile({
      age: 30,
      heightCm: 160,
      currentWeightKg: 55,
      targetWeightKg: 45,
      targetDays: 20,
      gender: 'female',
      activityLevel: 'low',
    })).toEqual({
      kcal: 1200,
      protein: 110,
      fat: 33,
      carbs: 116,
      bmr: 1239,
      estimatedDailyBurnKcal: 1487,
      dailyCalorieAdjustment: -3850,
      warning: '目標達成日数が短いため、最低摂取カロリー 1200 kcal に補正しました。',
    });
  });
});
