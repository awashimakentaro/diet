/* 【責務】
 * 筋トレ強度・体重・時間から運動消費カロリーを計算する。
 */

import type { WorkoutIntensity } from '../../types';

const METS_BY_INTENSITY: Record<WorkoutIntensity, number> = {
  light: 3.5,
  normal: 5,
  hard: 6,
};

type CalculateWorkoutBurnedKcalParams = {
  intensity: WorkoutIntensity;
  weightKg: number;
  durationMinutes: number;
};

export function calculateWorkoutBurnedKcal({
  intensity,
  weightKg,
  durationMinutes,
}: CalculateWorkoutBurnedKcalParams): number {
  const hours = durationMinutes / 60;
  return Math.max(0, Math.round(METS_BY_INTENSITY[intensity] * weightKg * hours));
}
