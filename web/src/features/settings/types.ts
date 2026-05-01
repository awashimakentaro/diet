/* 【責務】
 * Settings feature 内で共有するフォーム型を定義する。
 */

export type ManualTargetValues = {
  kcal: string;
  protein: string;
  fat: string;
  carbs: string;
};

export type ProfileValues = {
  username: string;
  displayName: string;
  bio: string;
  age: string;
  heightCm: string;
  currentWeightKg: string;
  targetWeightKg: string;
  targetDays: string;
};

export type ActivityLevel = 'low' | 'moderate' | 'high';
export type Gender = 'male' | 'female';
export type SettingsSaveAction = 'manual-goal' | 'profile' | 'auto-goal' | 'notification' | null;
export type SettingsSaveStatus = 'idle' | 'saving' | 'success' | 'error';
export type ReminderSlot = 'morning' | 'noon' | 'evening' | 'night';
