/* 【責務】
 * Settings のプロフィールフォーム値を保存 payload へ変換する。
 */

import type { ActivityLevel, Gender, ProfileValues } from '../../types';

export type ProfilePayload = {
  username: string;
  displayName: string;
  bio: string;
  gender: Gender;
  age: number;
  heightCm: number;
  currentWeightKg: number;
  targetWeightKg: number;
  targetDays: number;
  activityLevel: ActivityLevel;
};

type BuildProfilePayloadParams = {
  values: ProfileValues;
  gender: Gender;
  activityLevel: ActivityLevel;
};

type BuildProfilePayloadResult =
  | { ok: true; payload: ProfilePayload }
  | { ok: false; error: string };

function toNumberOrNull(value: string): number | null {
  if (value.trim().length === 0) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function buildProfilePayload({
  values,
  gender,
  activityLevel,
}: BuildProfilePayloadParams): BuildProfilePayloadResult {
  const age = toNumberOrNull(values.age);
  const heightCm = toNumberOrNull(values.heightCm);
  const currentWeightKg = toNumberOrNull(values.currentWeightKg);
  const targetWeightKg = toNumberOrNull(values.targetWeightKg);
  const targetDays = toNumberOrNull(values.targetDays);

  if (
    age === null
    || heightCm === null
    || currentWeightKg === null
    || targetWeightKg === null
    || targetDays === null
  ) {
    return {
      ok: false,
      error: 'プロフィールの数値項目を確認してください。',
    };
  }

  return {
    ok: true,
    payload: {
      username: values.username,
      displayName: values.displayName,
      bio: values.bio,
      gender,
      age,
      heightCm,
      currentWeightKg,
      targetWeightKg,
      targetDays,
      activityLevel,
    },
  };
}
