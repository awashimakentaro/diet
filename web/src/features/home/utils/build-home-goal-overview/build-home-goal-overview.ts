/* 【責務】
 * Home 表示用の目標進捗とカロリー収支を組み立てる。
 */

import type { UserProfileRow } from '@/features/settings/api/get-user-profile';
import { calculateGoalFromProfile } from '@/features/settings/utils/calculate-goal-from-profile';
import type { WebGoal } from '@/domain/web-diet-schema';

type GoalDirection = 'deficit' | 'surplus' | 'maintain';

export type HomeGoalOverview = {
  isProfileReady: boolean;
  currentWeightKg: number;
  targetWeightKg: number;
  targetDays: number;
  targetIntakeKcal: number;
  calculatedTargetIntakeKcal: number;
  bmr: number;
  estimatedDailyBurnKcal: number;
  dailyCalorieAdjustment: number;
  requiredDailyGapKcal: number;
  direction: GoalDirection;
  intakeKcal: number;
  workoutKcal: number;
  balanceKcal: number;
  warning: string | null;
};

type ReadyProfile = UserProfileRow & {
  gender: 'male' | 'female';
  age: number;
  height_cm: number | string;
  current_weight_kg: number | string;
  target_weight_kg: number | string;
  target_days: number;
  activity_level: 'low' | 'moderate' | 'high';
};

function isReadyProfile(profile: UserProfileRow | null): profile is ReadyProfile {
  if (profile === null) {
    return false;
  }

  return (
    (profile.gender === 'male' || profile.gender === 'female')
    && Number.isFinite(Number(profile.age))
    && Number.isFinite(Number(profile.height_cm))
    && Number.isFinite(Number(profile.current_weight_kg))
    && Number.isFinite(Number(profile.target_weight_kg))
    && Number.isFinite(Number(profile.target_days))
    && Number(profile.target_days) > 0
    && (profile.activity_level === 'low' || profile.activity_level === 'moderate' || profile.activity_level === 'high')
  );
}

function getDirection(adjustment: number): GoalDirection {
  if (adjustment < 0) {
    return 'deficit';
  }

  if (adjustment > 0) {
    return 'surplus';
  }

  return 'maintain';
}

export function buildHomeGoalOverview(
  profile: UserProfileRow | null,
  goal: WebGoal | null,
  intakeKcal: number,
  workoutKcal: number,
): HomeGoalOverview {
  if (!isReadyProfile(profile)) {
    return {
      isProfileReady: false,
      currentWeightKg: 0,
      targetWeightKg: 0,
      targetDays: 0,
      targetIntakeKcal: 0,
      calculatedTargetIntakeKcal: 0,
      bmr: 0,
      estimatedDailyBurnKcal: 0,
      dailyCalorieAdjustment: 0,
      requiredDailyGapKcal: 0,
      direction: 'maintain',
      intakeKcal,
      workoutKcal,
      balanceKcal: intakeKcal - workoutKcal,
      warning: null,
    };
  }

  const calculatedGoal = calculateGoalFromProfile({
    age: Number(profile.age),
    heightCm: Number(profile.height_cm),
    currentWeightKg: Number(profile.current_weight_kg),
    targetWeightKg: Number(profile.target_weight_kg),
    targetDays: Number(profile.target_days),
    gender: profile.gender,
    activityLevel: profile.activity_level,
  });

  return {
    isProfileReady: true,
    currentWeightKg: Number(profile.current_weight_kg),
    targetWeightKg: Number(profile.target_weight_kg),
    targetDays: Number(profile.target_days),
    targetIntakeKcal: goal?.totals.kcal ?? calculatedGoal.kcal,
    calculatedTargetIntakeKcal: calculatedGoal.kcal,
    bmr: calculatedGoal.bmr,
    estimatedDailyBurnKcal: calculatedGoal.estimatedDailyBurnKcal,
    dailyCalorieAdjustment: calculatedGoal.dailyCalorieAdjustment,
    requiredDailyGapKcal: Math.abs(calculatedGoal.dailyCalorieAdjustment),
    direction: getDirection(calculatedGoal.dailyCalorieAdjustment),
    intakeKcal,
    workoutKcal,
    balanceKcal: intakeKcal - (calculatedGoal.bmr + workoutKcal),
    warning: calculatedGoal.warning,
  };
}
