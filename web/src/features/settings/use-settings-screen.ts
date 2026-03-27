'use client';

/**
 * web/src/features/settings/use-settings-screen.ts
 *
 * 【責務】
 * Settings 画面のローカル入力 state と表示用ハンドラをまとめる。
 *
 * 【使用されるエージェント / 処理フロー】
 * - settings-screen.tsx から呼ばれる。
 * - mockGoal / mockProfileSnapshot を初期値に使う。
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
  mockProfileSnapshot,
} from '@/data/mock-diet-data';

type ManualTargetValues = {
  kcal: string;
  protein: string;
  fat: string;
  carbs: string;
};

type ProfileValues = {
  age: string;
  heightCm: string;
  currentWeightKg: string;
  targetWeightKg: string;
  targetDays: string;
};


type ActivityLevel = 'low' | 'moderate' | 'high';
type Gender = 'male' | 'female';

export type UseSettingsScreenResult = {
  manualTargets: ManualTargetValues;
  profileValues: ProfileValues;
  gender: Gender;
  activityLevel: ActivityLevel;
  accountEmail: string;
  feedbackMessage: string | null;
  handleManualTargetChange: (field: keyof ManualTargetValues, value: string) => void;
  handleProfileValueChange: (field: keyof ProfileValues, value: string) => void;
  handleGenderChange: (value: Gender) => void;
  handleActivityChange: (value: ActivityLevel) => void;
  handleManualTargetSubmit: () => void;
  handleSaveProfile: () => void;
  handleRunAutoCalculate: () => void;
  handleSignOut: () => Promise<void>;
};

function toGenderValue(value: string): Gender {
  return value === 'female' ? 'female' : 'male';
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
    age: String(mockProfileSnapshot.age),
    heightCm: String(mockProfileSnapshot.heightCm),
    currentWeightKg: String(mockProfileSnapshot.currentWeightKg.toFixed(1)),
    targetWeightKg: String(mockProfileSnapshot.targetWeightKg.toFixed(1)),
    targetDays: String(mockProfileSnapshot.targetWeeks * 7),
  });

  const [gender, setGender] = useState<Gender>(toGenderValue(mockProfileSnapshot.gender));
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(mockProfileSnapshot.activityLevel);

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

  function handleManualTargetSubmit(): void {
    setFeedbackMessage('手動目標のローカル更新を反映しました。');
  }

  function handleSaveProfile(): void {
    setFeedbackMessage('プロフィール変更をローカル保存しました。');
  }

  function handleRunAutoCalculate(): void {
    const age = Number(profileValues.age);
    const height = Number(profileValues.heightCm);
    const weight = Number(profileValues.currentWeightKg);
    const targetWeight = Number(profileValues.targetWeightKg);

    if (isNaN(age) || isNaN(height) || isNaN(weight) || isNaN(targetWeight)) {
      setFeedbackMessage('数値を正しく入力してください。');
      return;
    }

    // BMR (Mifflin-St Jeor)
    let bmr = 10 * weight + 6.25 * height - 5 * age;
    bmr += gender === 'male' ? 5 : -161;

    // TDEE
    const multipliers: Record<ActivityLevel, number> = {
      low: 1.2,
      moderate: 1.55,
      high: 1.75,
    };
    const tdee = bmr * multipliers[activityLevel];

    // Target Calories
    let targetKcal = tdee;
    if (targetWeight < weight) {
      targetKcal -= 500; // 減量
    } else if (targetWeight > weight) {
      targetKcal += 300; // 筋肉増強
    }

    targetKcal = Math.round(targetKcal);

    // Macros
    // Protein: 2.0g per kg of weight (Athlete/Gym standard)
    const protein = Math.round(weight * 2.0);
    // Fat: 25% of total calories
    const fat = Math.round((targetKcal * 0.25) / 9);
    // Carbs: Remainder
    const carbs = Math.round((targetKcal - protein * 4 - fat * 9) / 4);

    setManualTargets({
      kcal: String(targetKcal),
      protein: String(protein),
      fat: String(fat),
      carbs: String(carbs),
    });

    setFeedbackMessage('身体情報から最適な目標（減量・バルクアップ等）を自動計算しました。');
  }


  async function handleSignOut(): Promise<void> {
    await signOut();
  }

  return {
    manualTargets,
    profileValues,
    gender,
    activityLevel,
    accountEmail: user?.email ?? 'guest@example.com',
    feedbackMessage,
    handleManualTargetChange,
    handleProfileValueChange,
    handleGenderChange,
    handleActivityChange,
    handleManualTargetSubmit,
    handleSaveProfile,
    handleRunAutoCalculate,
    handleSignOut,
  };
}
