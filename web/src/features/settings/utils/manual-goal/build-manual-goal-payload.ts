/* 【責務】
 * Settings の手動目標フォーム値を保存 payload へ変換する。
 */

import type { ManualTargetValues } from '../../types';

export type ManualGoalPayload = {
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
};

type BuildManualGoalPayloadResult =
  | { ok: true; payload: ManualGoalPayload }
  | { ok: false; error: string };

function toNumberOrNull(value: string): number | null {
  if (value.trim().length === 0) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function buildManualGoalPayload(
  values: ManualTargetValues,
): BuildManualGoalPayloadResult {
  const kcal = toNumberOrNull(values.kcal);
  const protein = toNumberOrNull(values.protein);
  const fat = toNumberOrNull(values.fat);
  const carbs = toNumberOrNull(values.carbs);

  if (kcal === null || protein === null || fat === null || carbs === null) {
    return {
      ok: false,
      error: '目標値はすべて数値で入力してください。',
    };
  }

  return {
    ok: true,
    payload: { kcal, protein, fat, carbs },
  };
}
