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
import { calculateGoalFromProfile } from '../../utils/calculate-goal-from-profile';
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
  ReminderSlot,
} from '../../types';
import { buildManualGoalPayload } from '../../utils/manual-goal';
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
  handleManualTargetChange: (field: keyof ManualTargetValues, value: string) => void;
  handleProfileValueChange: (field: keyof ProfileValues, value: string) => void;
  handleGenderChange: (value: Gender) => void;
  handleActivityChange: (value: ActivityLevel) => void;
  handleManualTargetSubmit: () => void;
  handleSaveProfile: () => void;
  handleRunAutoCalculate: () => void;
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

export function useSettingsScreen(): UseSettingsScreenResult {
  const { user, signOut } = useWebAuth();
  const manualGoal = useManualGoalForm();
  const profileGoal = useProfileGoalForm({ email: user?.email });
  const notification = useNotificationSettings();
  const saveState = useSettingsSaveStatus();
  const account = useSettingsAccount({ email: user?.email, signOut });
  const [isLoading, setIsLoading] = useState(true);
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

  function handleManualTargetSubmit(): void {
    const result = buildManualGoalPayload(manualGoal.manualTargets);

    if (!result.ok) {
      saveState.markSaveError('manual-goal');
      return;
    }

    void saveState.runSaveAction('manual-goal', async () => {
      await saveSettingsGoal(result.payload);
    });
  }

  function handleSaveProfile(): void {
    const result = buildProfilePayload({
      values: profileGoal.profileValues,
      gender: profileGoal.gender,
      activityLevel: profileGoal.activityLevel,
    });

    if (!result.ok) {
      saveState.markSaveError('profile');
      return;
    }

    void saveState.runSaveAction('profile', async () => {
      await saveUserProfile(result.payload);
    });
  }

  function handleRunAutoCalculate(): void {
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
      saveState.markSaveError('auto-goal');
      return;
    }

    const goal = calculateGoalFromProfile(inputResult.input);

    manualGoal.setManualTargets({
      kcal: String(goal.kcal),
      protein: String(goal.protein),
      fat: String(goal.fat),
      carbs: String(goal.carbs),
    });

    void saveState.runSaveAction('auto-goal', async () => {
      await saveUserProfile(profileResult.payload);
      await saveSettingsGoal({
        kcal: goal.kcal,
        protein: goal.protein,
        fat: goal.fat,
        carbs: goal.carbs,
      });
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
    handleManualTargetChange: manualGoal.handleManualTargetChange,
    handleProfileValueChange: profileGoal.handleProfileValueChange,
    handleGenderChange: profileGoal.handleGenderChange,
    handleActivityChange: profileGoal.handleActivityChange,
    handleManualTargetSubmit,
    handleSaveProfile,
    handleRunAutoCalculate,
    handleToggleNotificationEnabled: notification.handleToggleNotificationEnabled,
    handleSelectReminder: notification.handleSelectReminder,
    handleSaveNotification,
    handleSignOut: account.handleSignOut,
  };
}
