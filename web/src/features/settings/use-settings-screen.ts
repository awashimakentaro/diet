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
import { useRouter } from 'next/navigation';

import { useWebAuth } from '@/app/provider';
import { paths } from '@/config/paths';
import {
  mockGoal,
  mockProfileSnapshot,
} from '@/data/mock-diet-data';

import { getSettingsGoal } from './get-settings-goal';
import { getUserProfile } from './get-user-profile';
import { calculateGoalFromProfile } from './calculate-goal-from-profile';
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
type SettingsSaveAction = 'manual-goal' | 'profile' | 'auto-goal' | null;

export type UseSettingsScreenResult = {
  manualTargets: ManualTargetValues;
  profileValues: ProfileValues;
  gender: Gender;
  activityLevel: ActivityLevel;
  accountEmail: string;
  isSaving: boolean;
  isSigningOut: boolean;
  activeSaveAction: SettingsSaveAction;
  saveStatus: 'idle' | 'saving' | 'success' | 'error';
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
  const router = useRouter();
  const { user, signOut } = useWebAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [activeSaveAction, setActiveSaveAction] = useState<SettingsSaveAction>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
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
      setActiveSaveAction('manual-goal');
      setSaveStatus('error');
      return;
    }

    try {
      setActiveSaveAction('manual-goal');
      setIsSaving(true);
      setSaveStatus('saving');
      await saveSettingsGoal({ kcal, protein, fat, carbs });
      setSaveStatus('success');
    } catch {
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
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
      setActiveSaveAction('profile');
      setSaveStatus('error');
      return;
    }

    try {
      setActiveSaveAction('profile');
      setIsSaving(true);
      setSaveStatus('saving');
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
      setSaveStatus('success');
    } catch {
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRunAutoCalculate(): Promise<void> {
    const age = Number(profileValues.age);
    const height = Number(profileValues.heightCm);
    const weight = Number(profileValues.currentWeightKg);
    const targetWeight = Number(profileValues.targetWeightKg);

    if (isNaN(age) || isNaN(height) || isNaN(weight) || isNaN(targetWeight)) {
      setActiveSaveAction('auto-goal');
      setSaveStatus('error');
      return;
    }

    const goal = calculateGoalFromProfile({
      age,
      heightCm: height,
      currentWeightKg: weight,
      targetWeightKg: targetWeight,
      gender,
      activityLevel,
    });

    setManualTargets({
      kcal: String(goal.kcal),
      protein: String(goal.protein),
      fat: String(goal.fat),
      carbs: String(goal.carbs),
    });

    try {
      setActiveSaveAction('auto-goal');
      setIsSaving(true);
      setSaveStatus('saving');
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
        kcal: goal.kcal,
        protein: goal.protein,
        fat: goal.fat,
        carbs: goal.carbs,
      });
      setSaveStatus('success');
    } catch {
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  }


  async function handleSignOut(): Promise<void> {
    try {
      setIsSigningOut(true);
      await signOut();
      router.replace(paths.home.getHref());
    } finally {
      setIsSigningOut(false);
    }
  }

  return {
    manualTargets,
    profileValues,
    gender,
    activityLevel,
    accountEmail: user?.email ?? 'guest@example.com',
    isSaving,
    isSigningOut,
    activeSaveAction,
    saveStatus,
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
