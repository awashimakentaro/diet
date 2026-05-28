/* 【責務】
 * Settings の自動目標計算に使うプロフィール入力を組み立てる。
 */

import type { ActivityLevel, Gender, ProfileValues } from '../../types';

export type AutoGoalProfileInput = {
  age: number;
  heightCm: number;
  currentWeightKg: number;
  targetWeightKg: number;
  targetDays: number;
  gender: Gender;
  activityLevel: ActivityLevel;
};

type BuildAutoGoalProfileInputParams = {
  values: ProfileValues;
  gender: Gender;
  activityLevel: ActivityLevel;
};

type BuildAutoGoalProfileInputResult =
  | { ok: true; input: AutoGoalProfileInput }
  | { ok: false; error: string };

export function buildAutoGoalProfileInput({
  values,
  gender,
  activityLevel,
}: BuildAutoGoalProfileInputParams): BuildAutoGoalProfileInputResult {
  const age = Number(values.age);
  const heightCm = Number(values.heightCm);
  const currentWeightKg = Number(values.currentWeightKg);
  const targetWeightKg = Number(values.targetWeightKg);
  const targetDays = Number(values.targetDays);

  if (
    Number.isNaN(age)
    || Number.isNaN(heightCm)
    || Number.isNaN(currentWeightKg)
    || Number.isNaN(targetWeightKg)
    || Number.isNaN(targetDays)
    || targetDays <= 0
  ) {
    return {
      ok: false,
      error: '自動計算に必要な数値項目を確認してください。',
    };
  }

  return {
    ok: true,
    input: {
      age,
      heightCm,
      currentWeightKg,
      targetWeightKg,
      targetDays,
      gender,
      activityLevel,
    },
  };
}
