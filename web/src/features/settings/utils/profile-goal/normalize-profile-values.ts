/* 【責務】
 * Settings のプロフィール初期値と選択値を正規化する。
 */

import type { ActivityLevel, Gender, ProfileValues } from '../../types';
import type { UserProfileRow } from '../../api/get-user-profile';

export function toGenderValue(value: string): Gender {
  return value === 'female' ? 'female' : 'male';
}

export function toActivityLevel(value: string | null | undefined): ActivityLevel {
  if (value === 'low' || value === 'high') {
    return value;
  }

  return 'moderate';
}

function toStringValue(value: number | string | null | undefined): string {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value);
}

export function buildProfileValuesFromRow(profile: UserProfileRow): ProfileValues {
  return {
    username: profile.username,
    displayName: profile.display_name ?? '',
    bio: profile.bio ?? '',
    age: toStringValue(profile.age),
    heightCm: toStringValue(profile.height_cm),
    currentWeightKg: toStringValue(profile.current_weight_kg),
    targetWeightKg: toStringValue(profile.target_weight_kg),
    targetDays: toStringValue(profile.target_days),
  };
}
