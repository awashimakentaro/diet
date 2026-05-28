/* 【責務】
 * プロフィール入力から目標 kcal / PFC を計算する。
 */

type ActivityLevel = 'low' | 'moderate' | 'high';
type Gender = 'male' | 'female';

type CalculateGoalFromProfileParams = {
  age: number;
  heightCm: number;
  currentWeightKg: number;
  targetWeightKg: number;
  targetDays: number;
  gender: Gender;
  activityLevel: ActivityLevel;
};

export type CalculatedGoal = {
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
  bmr: number;
  estimatedDailyBurnKcal: number;
  dailyCalorieAdjustment: number;
  warning: string | null;
};

const CALORIES_PER_WEIGHT_KG = 7700;
const FAT_RATIO = 0.25;
const PROTEIN_GRAMS_PER_WEIGHT_KG = 2;

export function calculateGoalFromProfile({
  age,
  heightCm,
  currentWeightKg,
  targetWeightKg,
  targetDays,
  gender,
  activityLevel,
}: CalculateGoalFromProfileParams): CalculatedGoal {
  let bmr = 10 * currentWeightKg + 6.25 * heightCm - 5 * age;
  bmr += gender === 'male' ? 5 : -161;

  const multipliers: Record<ActivityLevel, number> = {
    low: 1.2,
    moderate: 1.55,
    high: 1.75,
  };
  const estimatedDailyBurnKcal = Math.round(bmr * multipliers[activityLevel]);
  const weightDiffKg = targetWeightKg - currentWeightKg;
  const dailyCalorieAdjustment = Math.round((weightDiffKg * CALORIES_PER_WEIGHT_KG) / targetDays);
  const minimumKcal = gender === 'male' ? 1500 : 1200;
  const calculatedTargetKcal = estimatedDailyBurnKcal + dailyCalorieAdjustment;
  const targetKcal = Math.max(minimumKcal, Math.round(calculatedTargetKcal));
  const protein = Math.round(currentWeightKg * PROTEIN_GRAMS_PER_WEIGHT_KG);
  const fat = Math.round((targetKcal * FAT_RATIO) / 9);
  const carbs = Math.max(0, Math.round((targetKcal - protein * 4 - fat * 9) / 4));
  const warning = calculatedTargetKcal < minimumKcal
    ? `目標達成日数が短いため、最低摂取カロリー ${minimumKcal} kcal に補正しました。`
    : null;

  return {
    kcal: targetKcal,
    protein,
    fat,
    carbs,
    bmr: Math.round(bmr),
    estimatedDailyBurnKcal,
    dailyCalorieAdjustment,
    warning,
  };
}
