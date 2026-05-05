/* 【責務】
 * 筋トレ以外のワークアウト入力値を保存用 payload に変換する。
 */

import type { OtherWorkoutFormValues } from '../types';

type OtherWorkoutLogPayload = {
  name: string;
  durationMinutes: number;
  burnedKcal: number;
  note: string;
};

type BuildOtherWorkoutLogPayloadResult =
  | { ok: true; payload: OtherWorkoutLogPayload }
  | { ok: false };

function parsePositiveNumber(value: string): number | null {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

export function buildOtherWorkoutLogPayload(
  values: OtherWorkoutFormValues,
): BuildOtherWorkoutLogPayloadResult {
  const name = values.name.trim();
  const durationMinutes = parsePositiveNumber(values.durationMinutes);
  const burnedKcal = parsePositiveNumber(values.burnedKcal);

  if (name.length === 0 || durationMinutes === null || burnedKcal === null) {
    return { ok: false };
  }

  return {
    ok: true,
    payload: {
      name,
      durationMinutes: Math.round(durationMinutes),
      burnedKcal: Math.round(burnedKcal),
      note: values.note.trim(),
    },
  };
}
