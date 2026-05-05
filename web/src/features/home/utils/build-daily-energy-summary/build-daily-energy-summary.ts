/* 【責務】
 * Home 表示用の1日カロリー収支内訳を組み立てる。
 */

import type { UserProfileRow } from '@/features/settings/api/get-user-profile';

type DailyEnergySummary = {
  intakeKcal: number;
  bmr: number;
  workoutKcal: number;
  balanceKcal: number;
  isProfileReady: boolean;
};

type ReadyProfile = UserProfileRow & {
  gender: 'male' | 'female';
  age: number;
  height_cm: number | string;
  current_weight_kg: number | string;
};

function isProfileReady(profile: UserProfileRow | null): profile is ReadyProfile {
  if (profile === null) {
    return false;
  }

  return (
    (profile.gender === 'male' || profile.gender === 'female')
    && Number.isFinite(Number(profile.age))
    && Number.isFinite(Number(profile.height_cm))
    && Number.isFinite(Number(profile.current_weight_kg))
  );
}

function calculateBmr(profile: ReadyProfile): number {
  let bmr = 10 * Number(profile.current_weight_kg) + 6.25 * Number(profile.height_cm) - 5 * Number(profile.age);
  bmr += profile.gender === 'male' ? 5 : -161;

  return Math.round(bmr);
}

export function buildDailyEnergySummary(
  profile: UserProfileRow | null,
  intakeKcal: number,
  workoutKcal: number,
): DailyEnergySummary {
  if (!isProfileReady(profile)) {
    return {
      intakeKcal,
      bmr: 0,
      workoutKcal,
      balanceKcal: intakeKcal - workoutKcal,
      isProfileReady: false,
    };
  }

  const bmr = calculateBmr(profile);

  return {
    intakeKcal,
    bmr,
    workoutKcal,
    balanceKcal: intakeKcal - (bmr + workoutKcal),
    isProfileReady: true,
  };
}
