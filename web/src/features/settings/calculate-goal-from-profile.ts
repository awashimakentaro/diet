/**
 * web/src/features/settings/calculate-goal-from-profile.ts
 *
 * 【責務】
 * プロフィール入力から目標 kcal / PFC を計算する。
 *
 * 【使用されるエージェント / 処理フロー】
 * - settings の自動計算ボタンから呼ばれる。
 * - onboarding の初期目標生成から呼ばれる。
 *
 * 【やらないこと】
 * - DB 保存
 * - UI 描画
 * - 入力フォーム管理
 *
 * 【他ファイルとの関係】
 * - use-settings-screen.ts と onboarding 画面から利用される。
 */

type ActivityLevel = 'low' | 'moderate' | 'high';
type Gender = 'male' | 'female';

type CalculateGoalFromProfileParams = {
  age: number;
  heightCm: number;
  currentWeightKg: number;
  targetWeightKg: number;
  gender: Gender;
  activityLevel: ActivityLevel;
};

type CalculatedGoal = {
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
};

export function calculateGoalFromProfile({
  age,
  heightCm,
  currentWeightKg,
  targetWeightKg,
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
  const tdee = bmr * multipliers[activityLevel];

  let targetKcal = tdee;
  if (targetWeightKg < currentWeightKg) {
    targetKcal -= 500;
  } else if (targetWeightKg > currentWeightKg) {
    targetKcal += 300;
  }

  targetKcal = Math.round(targetKcal);

  const protein = Math.round(currentWeightKg * 2.0);
  const fat = Math.round((targetKcal * 0.25) / 9);
  const carbs = Math.round((targetKcal - protein * 4 - fat * 9) / 4);

  return {
    kcal: targetKcal,
    protein,
    fat,
    carbs,
  };
}
