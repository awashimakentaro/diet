/* 【責務】
 * プロフィールから基礎代謝と活動込み消費カロリーを計算する。
 */

type ActivityLevel = 'low' | 'moderate' | 'high';
type Gender = 'male' | 'female';

type CalculateProfileEnergyParams = {
  gender: Gender;
  age: number;
  heightCm: number;
  currentWeightKg: number;
  activityLevel: ActivityLevel;
};

export type ProfileEnergy = {
  bmr: number;
  activityKcal: number;
  tdee: number;
};

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  low: 1.2,
  moderate: 1.55,
  high: 1.75,
};

export function calculateProfileEnergy({
  gender,
  age,
  heightCm,
  currentWeightKg,
  activityLevel,
}: CalculateProfileEnergyParams): ProfileEnergy {
  let bmr = 10 * currentWeightKg + 6.25 * heightCm - 5 * age;
  bmr += gender === 'male' ? 5 : -161;

  const roundedBmr = Math.round(bmr);
  const tdee = Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);

  return {
    bmr: roundedBmr,
    activityKcal: Math.max(0, tdee - roundedBmr),
    tdee,
  };
}
