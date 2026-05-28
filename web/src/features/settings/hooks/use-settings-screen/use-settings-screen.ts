'use client';

/* 【責務】
 * Settings 画面で使うフォーム・保存・アカウント hook を合成する。
 */

import { useEffect, useState } from 'react';

import { useWebAuth } from '@/app/provider';

import { getSettingsGoal } from '../../api/get-settings-goal';
import { getUserProfile } from '../../api/get-user-profile';
import { saveSettingsGoal } from '../../api/save-settings-goal';
import { saveUserProfile } from '../../api/save-user-profile';
import { calculateGoalFromProfile, type CalculatedGoal } from '../../utils/calculate-goal-from-profile';
import { useManualGoalForm } from '../use-manual-goal-form';
import { useNotificationSettings } from '../use-notification-settings';
import { useProfileGoalForm } from '../use-profile-goal-form';
import { useSettingsAccount } from '../use-settings-account';
import { useSettingsSaveStatus } from '../use-settings-save-status';
import type {
  ActivityLevel,
  Gender,
  ManualTargetValues,
  ProfileValues,
  SettingsSaveAction,
  SettingsSaveStatus,
  SettingsValidationErrors,
  ReminderSlot,
} from '../../types';
import type { ManualGoalPayload } from '../../utils/manual-goal';
import {
  buildAutoGoalProfileInput,
  buildProfilePayload,
  buildProfileValuesFromRow,
  toActivityLevel,
  toGenderValue,
} from '../../utils/profile-goal';
import { sanitizeEmailPrefix } from '../../utils/account';

export type UseSettingsScreenResult = {
  manualTargets: ManualTargetValues;
  profileValues: ProfileValues;
  gender: Gender;
  activityLevel: ActivityLevel;
  accountEmail: string;
  notificationsEnabled: boolean;
  selectedReminder: ReminderSlot;
  isSaving: boolean;
  isSigningOut: boolean;
  activeSaveAction: SettingsSaveAction;
  saveStatus: SettingsSaveStatus;
  isLoading: boolean;
  autoGoalPreview: CalculatedGoal | null;
  validationErrors: SettingsValidationErrors;
  validationFocusRequest: number;
  handleManualTargetChange: (field: keyof ManualTargetValues, value: string) => void;
  handleProfileValueChange: (field: keyof ProfileValues, value: string) => void;
  handleGenderChange: (value: Gender) => void;
  handleActivityChange: (value: ActivityLevel) => void;
  handleSaveProfile: () => void;
  handleToggleNotificationEnabled: () => void;
  handleSelectReminder: (value: ReminderSlot) => void;
  handleSaveNotification: () => void;
  handleSignOut: () => Promise<void>;
};

function buildManualTargetsFromGoal(goal: {
  calories: number | string;
  protein: number | string;
  fat: number | string;
  carbs: number | string;
}): ManualTargetValues {
  return {
    kcal: String(goal.calories),
    protein: String(goal.protein),
    fat: String(goal.fat),
    carbs: String(goal.carbs),
  };
}

function toOptionalNumber(value: string): number | null {
  if (value.trim().length === 0) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function buildAutoMacros(targetKcal: number, currentWeightKg: number): Pick<ManualGoalPayload, 'protein' | 'fat' | 'carbs'> {
  const protein = Math.round(currentWeightKg * 2);
  const fat = Math.round((targetKcal * 0.25) / 9);
  const carbs = Math.max(0, Math.round((targetKcal - protein * 4 - fat * 9) / 4));

  return { protein, fat, carbs };
}

function buildGoalPayloadFromInputs(
  values: ManualTargetValues,
  currentWeightKg: number,
): ManualGoalPayload | null {
  const kcal = toOptionalNumber(values.kcal);

  if (kcal === null) {
    return null;
  }

  const autoMacros = buildAutoMacros(kcal, currentWeightKg);
  const protein = toOptionalNumber(values.protein) ?? autoMacros.protein;
  const fat = toOptionalNumber(values.fat) ?? autoMacros.fat;
  const carbs = toOptionalNumber(values.carbs) ?? autoMacros.carbs;

  if (![kcal, protein, fat, carbs].every(Number.isFinite)) {
    return null;
  }

  return { kcal, protein, fat, carbs };
}

const EMPTY_VALIDATION_ERRORS: SettingsValidationErrors = {
  profile: {},
  manualTargets: {},
};

function isMissing(value: string): boolean {
  return value.trim().length === 0;
}

function isInvalidNumber(value: string): boolean {
  return value.trim().length > 0 && !Number.isFinite(Number(value));
}

function buildSettingsValidationErrors(
  profileValues: ProfileValues,
  manualTargets: ManualTargetValues,
): SettingsValidationErrors {
  const profile: SettingsValidationErrors['profile'] = {};
  const manualTargetErrors: SettingsValidationErrors['manualTargets'] = {};
  const requiredProfileFields: Array<{
    field: keyof ProfileValues;
    label: string;
  }> = [
    { field: 'age', label: '年齢' },
    { field: 'heightCm', label: '身長' },
    { field: 'currentWeightKg', label: '現在の体重' },
    { field: 'targetWeightKg', label: '目標の体重' },
    { field: 'targetDays', label: '目標達成日数' },
  ];

  requiredProfileFields.forEach(({ field, label }) => {
    if (isMissing(profileValues[field])) {
      profile[field] = `${label}を入力してください`;
      return;
    }

    if (isInvalidNumber(profileValues[field])) {
      profile[field] = '数値で入力してください';
    }
  });

  if (isMissing(manualTargets.kcal)) {
    manualTargetErrors.kcal = '食事で1日に摂取したいカロリーを入力してください';
  } else if (isInvalidNumber(manualTargets.kcal)) {
    manualTargetErrors.kcal = '数値で入力してください';
  }

  (['protein', 'fat', 'carbs'] as Array<keyof ManualTargetValues>).forEach((field) => {
    if (isInvalidNumber(manualTargets[field])) {
      manualTargetErrors[field] = '数値で入力してください';
    }
  });

  return {
    profile,
    manualTargets: manualTargetErrors,
  };
}

function hasValidationErrors(errors: SettingsValidationErrors): boolean {
  return Object.keys(errors.profile).length > 0 || Object.keys(errors.manualTargets).length > 0;
}

export function useSettingsScreen(): UseSettingsScreenResult {
  const { user, signOut } = useWebAuth();
  const manualGoal = useManualGoalForm();
  const profileGoal = useProfileGoalForm({ email: user?.email });
  const notification = useNotificationSettings();
  const saveState = useSettingsSaveStatus();
  const account = useSettingsAccount({ email: user?.email, signOut });
  const [isLoading, setIsLoading] = useState(true);
  const [autoGoalPreview, setAutoGoalPreview] = useState<CalculatedGoal | null>(null);
  const [validationErrors, setValidationErrors] = useState<SettingsValidationErrors>(EMPTY_VALIDATION_ERRORS);
  const [validationFocusRequest, setValidationFocusRequest] = useState(0);
  const { setManualTargets } = manualGoal;
  const { setActivityLevel, setGender, setProfileValues } = profileGoal;

  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

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
          setManualTargets(buildManualTargetsFromGoal(goal));
        }

        if (profile !== null) {
          setProfileValues(buildProfileValuesFromRow(profile));
          setGender(toGenderValue(profile.gender ?? 'male'));
          setActivityLevel(toActivityLevel(profile.activity_level));
          return;
        }

        setProfileValues((current) => ({
          ...current,
          username: sanitizeEmailPrefix(user?.email),
        }));
      } catch {
        if (!isMounted) {
          return;
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadSettings();

    return () => {
      isMounted = false;
    };
  }, [setActivityLevel, setGender, setManualTargets, setProfileValues, user?.email, user?.id]);

  function handleProfileValueChange(field: keyof ProfileValues, value: string): void {
    profileGoal.handleProfileValueChange(field, value);
    setValidationErrors((current) => {
      const profile = { ...current.profile };
      delete profile[field];

      return { ...current, profile };
    });
  }

  function handleManualTargetChange(field: keyof ManualTargetValues, value: string): void {
    manualGoal.handleManualTargetChange(field, value);
    setValidationErrors((current) => {
      const manualTargets = { ...current.manualTargets };
      delete manualTargets[field];

      return { ...current, manualTargets };
    });
  }

  function handleSaveProfile(): void {
    const errors = buildSettingsValidationErrors(profileGoal.profileValues, manualGoal.manualTargets);

    setValidationErrors(errors);

    if (hasValidationErrors(errors)) {
      setValidationFocusRequest((current) => current + 1);
      saveState.markSaveError('profile');
      return;
    }

    const inputResult = buildAutoGoalProfileInput({
      values: profileGoal.profileValues,
      gender: profileGoal.gender,
      activityLevel: profileGoal.activityLevel,
    });
    const profileResult = buildProfilePayload({
      values: profileGoal.profileValues,
      gender: profileGoal.gender,
      activityLevel: profileGoal.activityLevel,
    });

    if (!inputResult.ok || !profileResult.ok) {
      saveState.markSaveError('profile');
      return;
    }

    const calculatedGoal = calculateGoalFromProfile(inputResult.input);
    const payload = buildGoalPayloadFromInputs(
      manualGoal.manualTargets,
      inputResult.input.currentWeightKg,
    );

    if (payload === null) {
      saveState.markSaveError('profile');
      return;
    }

    setAutoGoalPreview(calculatedGoal);
    manualGoal.setManualTargets({
      kcal: String(payload.kcal),
      protein: String(payload.protein),
      fat: String(payload.fat),
      carbs: String(payload.carbs),
    });

    void saveState.runSaveAction('profile', async () => {
      await saveUserProfile(profileResult.payload);
      await saveSettingsGoal(payload);
    });
  }

  function handleSaveNotification(): void {
    void saveState.runSaveAction('notification', async () => {
      const didSave = notification.handleSaveNotification();

      if (!didSave) {
        throw new Error('通知設定を保存できませんでした。');
      }
    });
  }

  return {
    manualTargets: manualGoal.manualTargets,
    profileValues: profileGoal.profileValues,
    gender: profileGoal.gender,
    activityLevel: profileGoal.activityLevel,
    accountEmail: account.accountEmail,
    notificationsEnabled: notification.notificationsEnabled,
    selectedReminder: notification.selectedReminder,
    isSaving: saveState.isSaving,
    isSigningOut: account.isSigningOut,
    activeSaveAction: saveState.activeSaveAction,
    saveStatus: saveState.saveStatus,
    isLoading,
    autoGoalPreview,
    validationErrors,
    validationFocusRequest,
    handleManualTargetChange,
    handleProfileValueChange,
    handleGenderChange: profileGoal.handleGenderChange,
    handleActivityChange: profileGoal.handleActivityChange,
    handleSaveProfile,
    handleToggleNotificationEnabled: notification.handleToggleNotificationEnabled,
    handleSelectReminder: notification.handleSelectReminder,
    handleSaveNotification,
    handleSignOut: account.handleSignOut,
  };
}
