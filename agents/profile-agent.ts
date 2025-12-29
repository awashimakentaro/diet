/**
 * agents/profile-agent.ts
 *
 * 【責務】
 * 体格情報の保存・取得と Snapshot 変換を行う。
 *
 * 【使用箇所】
 * - SettingsScreen
 * - GoalAgent（自動計算）
 *
 * 【やらないこと】
 * - 目標値の更新
 * - UI 状態管理
 *
 * 【他ファイルとの関係】
 * - lib/diet-store.ts の profile を読み書きする。
 */

import { Profile, ProfileSnapshot } from '@/constants/schema';
import { setDietState, getDietState } from '@/lib/diet-store';
import { createId } from '@/lib/id';

export type ProfileInput = {
  gender: Profile['gender'];
  birthDate: string;
  heightCm: number;
  currentWeightKg: number;
  targetWeightKg: number;
  targetDate: string;
  activityLevel: Profile['activityLevel'];
};

/**
 * 保存済み Profile を取得する。
 * 呼び出し元: SettingsScreen。
 * @returns Profile or null
 */
export function getProfile(): Profile | null {
  const profile = getDietState().profile;
  return profile ? { ...profile } : null;
}

/**
 * Profile を保存する。
 * 呼び出し元: SettingsScreen。
 * @param input UI からの入力値
 * @returns 保存後 Profile
 */
export function saveProfile(input: ProfileInput): Profile {
  validateProfile(input);
  const now = new Date().toISOString();
  const existing = getDietState().profile;
  const profile: Profile = {
    id: existing?.id ?? createId('profile'),
    gender: input.gender,
    birthDate: input.birthDate,
    heightCm: input.heightCm,
    currentWeightKg: input.currentWeightKg,
    targetWeightKg: input.targetWeightKg,
    targetDate: input.targetDate,
    activityLevel: input.activityLevel,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  setDietState((current) => ({ ...current, profile }));
  return { ...profile };
}

/**
 * GoalAgent 用の Snapshot を作成する。
 * 呼び出し元: Goal 計算。
 * @param profile 保存済み Profile
 * @returns ProfileSnapshot
 */
export function toSnapshot(profile: Profile): ProfileSnapshot {
  const today = new Date();
  const birth = new Date(profile.birthDate);
  const age = today.getFullYear() - birth.getFullYear();
  const targetDate = new Date(profile.targetDate);
  const diffMs = Math.max(targetDate.getTime() - today.getTime(), 0);
  const weeks = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 7)));
  return {
    gender: profile.gender,
    age,
    heightCm: profile.heightCm,
    currentWeightKg: profile.currentWeightKg,
    targetWeightKg: profile.targetWeightKg,
    targetWeeks: weeks,
    activityLevel: profile.activityLevel,
  };
}

function validateProfile(input: ProfileInput): void {
  if (input.heightCm < 100 || input.heightCm > 220) {
    throw new Error('身長は 100〜220cm の範囲で入力してください');
  }
  if (input.currentWeightKg < 30 || input.currentWeightKg > 200) {
    throw new Error('体重は 30〜200kg の範囲で入力してください');
  }
  if (new Date(input.targetDate) <= new Date()) {
    throw new Error('目標達成日は未来の日付を設定してください');
  }
}
