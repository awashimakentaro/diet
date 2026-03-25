'use client';

/**
 * web/src/features/settings/use-settings-screen.ts
 *
 * 【責務】
 * Settings 画面のローカル入力 state と表示用ハンドラをまとめる。
 *
 * 【使用されるエージェント / 処理フロー】
 * - settings-screen.tsx から呼ばれる。
 * - mockGoal / mockProfileSnapshot / mockNotificationSetting を初期値に使う。
 *
 * 【やらないこと】
 * - API 通信
 * - 永続化
 * - JSX 描画
 *
 * 【他ファイルとの関係】
 * - web/src/data/mock-diet-data.ts の設定初期値を利用する。
 * - app/provider.tsx の useWebAuth を利用する。
 */

import { useState } from 'react';

import { useWebAuth } from '@/app/provider';
import {
  mockGoal,
  mockNotificationSetting,
  mockProfileSnapshot,
} from '@/data/mock-diet-data';

type ManualTargetValues = {
  kcal: string;
  protein: string;
  fat: string;
  carbs: string;
};

type ProfileValues = {
  currentWeightKg: string;
  targetWeightKg: string;
  targetDays: string;
};

type ActivityLevel = 'low' | 'moderate' | 'high';
type Gender = 'male' | 'female';
type ReminderSlot = 'morning' | 'noon' | 'evening' | 'night';

export type UseSettingsScreenResult = {
  manualTargets: ManualTargetValues;
  profileValues: ProfileValues;
  gender: Gender;
  activityLevel: ActivityLevel;
  notificationsEnabled: boolean;
  selectedReminder: ReminderSlot;
  accountEmail: string;
  feedbackMessage: string | null;
  handleManualTargetChange: (field: keyof ManualTargetValues, value: string) => void;
  handleProfileValueChange: (field: keyof ProfileValues, value: string) => void;
  handleGenderChange: (value: Gender) => void;
  handleActivityChange: (value: ActivityLevel) => void;
  handleToggleNotifications: () => void;
  handleReminderSelect: (value: ReminderSlot) => void;
  handleManualTargetSubmit: () => void;
  handleSaveProfile: () => void;
  handleRunAutoCalculate: () => void;
  handleSaveNotifications: () => void;
  handleSignOut: () => Promise<void>;
};

function toGenderValue(value: string): Gender {
  return value === 'female' ? 'female' : 'male';
}

function toReminderSlot(value: string): ReminderSlot {
  if (value === 'noon' || value === 'evening' || value === 'night') {
    return value;
  }

  return 'morning';
}

export function useSettingsScreen(): UseSettingsScreenResult {
  const { user, signOut } = useWebAuth();
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [manualTargets, setManualTargets] = useState<ManualTargetValues>({
    kcal: String(mockGoal.totals.kcal),
    protein: String(mockGoal.totals.protein),
    fat: String(mockGoal.totals.fat),
    carbs: String(mockGoal.totals.carbs),
  });
  const [profileValues, setProfileValues] = useState<ProfileValues>({
    currentWeightKg: String(mockProfileSnapshot.currentWeightKg.toFixed(1)),
    targetWeightKg: String(mockProfileSnapshot.targetWeightKg.toFixed(1)),
    targetDays: String(mockProfileSnapshot.targetWeeks * 7),
  });
  const [gender, setGender] = useState<Gender>(toGenderValue(mockProfileSnapshot.gender));
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(mockProfileSnapshot.activityLevel);
  const [notificationsEnabled, setNotificationsEnabled] = useState(mockNotificationSetting.enabled);
  const [selectedReminder, setSelectedReminder] = useState<ReminderSlot>(toReminderSlot('night'));

  function handleManualTargetChange(field: keyof ManualTargetValues, value: string): void {
    setManualTargets((current) => ({ ...current, [field]: value }));
  }

  function handleProfileValueChange(field: keyof ProfileValues, value: string): void {
    setProfileValues((current) => ({ ...current, [field]: value }));
  }

  function handleGenderChange(value: Gender): void {
    setGender(value);
  }

  function handleActivityChange(value: ActivityLevel): void {
    setActivityLevel(value);
  }

  function handleToggleNotifications(): void {
    setNotificationsEnabled((current) => !current);
  }

  function handleReminderSelect(value: ReminderSlot): void {
    setSelectedReminder(value);
  }

  function handleManualTargetSubmit(): void {
    setFeedbackMessage('手動目標のローカル更新を反映しました。');
  }

  function handleSaveProfile(): void {
    setFeedbackMessage('プロフィール変更をローカル保存しました。');
  }

  function handleRunAutoCalculate(): void {
    setFeedbackMessage(`自動計算を実行しました。性別 ${gender} / 活動量 ${activityLevel} を反映対象にしています。`);
  }

  function handleSaveNotifications(): void {
    setFeedbackMessage(`通知設定を保存しました。現在は ${notificationsEnabled ? '有効' : '無効'} / ${selectedReminder} 枠を選択中です。`);
  }

  async function handleSignOut(): Promise<void> {
    await signOut();
  }

  return {
    manualTargets,
    profileValues,
    gender,
    activityLevel,
    notificationsEnabled,
    selectedReminder,
    accountEmail: user?.email ?? 'guest@example.com',
    feedbackMessage,
    handleManualTargetChange,
    handleProfileValueChange,
    handleGenderChange,
    handleActivityChange,
    handleToggleNotifications,
    handleReminderSelect,
    handleManualTargetSubmit,
    handleSaveProfile,
    handleRunAutoCalculate,
    handleSaveNotifications,
    handleSignOut,
  };
}
