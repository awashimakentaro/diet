'use client';

/**
 * web/src/features/settings/use-settings-screen.ts
 *
 * 【責務】
 * Settings 画面の入力 state、DB 初期取得、保存ハンドラをまとめる。
 *
 * 【使用されるエージェント / 処理フロー】
 * - settings-screen.tsx から呼ばれる。
 * - goals / user_profiles を読み込み、Settings 画面の初期値を組み立てる。
 *
 * 【やらないこと】
 * - JSX 描画
 *
 * 【他ファイルとの関係】
 * - app/provider.tsx の useWebAuth を利用する。
 * - get-settings-goal.ts / get-user-profile.ts / save 系関数を利用する。
 */

import { useEffect, useState } from 'react';

import { useWebAuth } from '@/app/provider';
import {
  mockGoal,
  mockProfileSnapshot,
} from '@/data/mock-diet-data';

import { getSettingsGoal } from './get-settings-goal';
import { getUserProfile } from './get-user-profile';
import { saveSettingsGoal } from './save-settings-goal';
import { saveUserProfile } from './save-user-profile';

type ManualTargetValues = {
  kcal: string;
  protein: string;
  fat: string;
  carbs: string;
};

type ProfileValues = {
  username: string;
  displayName: string;
  bio: string;
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

function toActivityLevel(value: string | null | undefined): ActivityLevel {
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

function sanitizeEmailPrefix(email: string | undefined): string {
  const localPart = (email ?? 'guest').split('@')[0] ?? 'guest';
  const sanitized = localPart.toLowerCase().replace(/[^a-z0-9_]/g, '_');
  return sanitized.length >= 3 ? sanitized : `user_${sanitized}`.slice(0, 24);
}

function toNumberOrNull(value: string): number | null {
  if (value.trim().length === 0) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
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
    username: sanitizeEmailPrefix(user?.email),
    displayName: '',
    bio: '',
    age: String(mockProfileSnapshot.age),
    heightCm: String(mockProfileSnapshot.heightCm),
    currentWeightKg: String(mockProfileSnapshot.currentWeightKg.toFixed(1)),
    targetWeightKg: String(mockProfileSnapshot.targetWeightKg.toFixed(1)),
    targetDays: String(mockProfileSnapshot.targetWeeks * 7),
  });

  const [gender, setGender] = useState<Gender>(toGenderValue(mockProfileSnapshot.gender));
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(mockProfileSnapshot.activityLevel);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    let isMounted = true;

    async function loadSettings(): Promise<void> {
      try {
        const [goal, profile] = await Promise.all([
          getSettingsGoal(),
          getUserProfile(),
        ]);

        if (!isMounted) {
          return;
        }

        if (goal !== null) {
          setManualTargets({
            kcal: toStringValue(goal.calories),
            protein: toStringValue(goal.protein),
            fat: toStringValue(goal.fat),
            carbs: toStringValue(goal.carbs),
          });
        }

        if (profile !== null) {
          setProfileValues({
            username: profile.username,
            displayName: profile.display_name ?? '',
            bio: profile.bio ?? '',
            age: toStringValue(profile.age),
            heightCm: toStringValue(profile.height_cm),
            currentWeightKg: toStringValue(profile.current_weight_kg),
            targetWeightKg: toStringValue(profile.target_weight_kg),
            targetDays: toStringValue(profile.target_days),
          });
          setGender(toGenderValue(profile.gender ?? mockProfileSnapshot.gender));
          setActivityLevel(toActivityLevel(profile.activity_level));
          return;
        }

        setProfileValues((current) => ({
          ...current,
          username: sanitizeEmailPrefix(user.email),
        }));
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setFeedbackMessage(error instanceof Error ? error.message : '設定の読込に失敗しました。');
      }
    }

    void loadSettings();

    return () => {
      isMounted = false;
    };
  }, [user?.email, user?.id]);

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

  async function handleManualTargetSubmit(): Promise<void> {
    const kcal = toNumberOrNull(manualTargets.kcal);
    const protein = toNumberOrNull(manualTargets.protein);
    const fat = toNumberOrNull(manualTargets.fat);
    const carbs = toNumberOrNull(manualTargets.carbs);

    if (kcal === null || protein === null || fat === null || carbs === null) {
      setFeedbackMessage('目標値はすべて数値で入力してください。');
      return;
    }

    try {
      await saveSettingsGoal({ kcal, protein, fat, carbs });
      setFeedbackMessage('手動目標を DB に保存しました。');
    } catch (error) {
      setFeedbackMessage(error instanceof Error ? error.message : '目標値の保存に失敗しました。');
    }
  }

  async function handleSaveProfile(): Promise<void> {
    const age = toNumberOrNull(profileValues.age);
    const heightCm = toNumberOrNull(profileValues.heightCm);
    const currentWeightKg = toNumberOrNull(profileValues.currentWeightKg);
    const targetWeightKg = toNumberOrNull(profileValues.targetWeightKg);
    const targetDays = toNumberOrNull(profileValues.targetDays);

    if (
      age === null
      || heightCm === null
      || currentWeightKg === null
      || targetWeightKg === null
      || targetDays === null
    ) {
      setFeedbackMessage('プロフィールの数値を正しく入力してください。');
      return;
    }

    try {
      await saveUserProfile({
        username: profileValues.username,
        displayName: profileValues.displayName,
        bio: profileValues.bio,
        gender,
        age,
        heightCm,
        currentWeightKg,
        targetWeightKg,
        targetDays,
        activityLevel,
      });
      setFeedbackMessage('プロフィールを DB に保存しました。');
    } catch (error) {
      setFeedbackMessage(error instanceof Error ? error.message : 'プロフィールの保存に失敗しました。');
    }
  }

  async function handleRunAutoCalculate(): Promise<void> {
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

    try {
      await saveUserProfile({
        username: profileValues.username,
        displayName: profileValues.displayName,
        bio: profileValues.bio,
        gender,
        age,
        heightCm: height,
        currentWeightKg: weight,
        targetWeightKg: targetWeight,
        targetDays: Number(profileValues.targetDays),
        activityLevel,
      });
      await saveSettingsGoal({
        kcal: targetKcal,
        protein,
        fat,
        carbs,
      });
      setFeedbackMessage('身体情報から目標を計算し、プロフィールと目標値を DB に保存しました。');
    } catch (error) {
      setFeedbackMessage(error instanceof Error ? error.message : '自動計算結果の保存に失敗しました。');
    }
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
