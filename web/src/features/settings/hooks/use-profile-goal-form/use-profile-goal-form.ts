'use client';

/* 【責務】
 * Settings 画面のプロフィールと自動目標計算フォームを管理する。
 */

import { useState } from 'react';

import { mockProfileSnapshot } from '@/data/mock-diet-data';

import type { ActivityLevel, Gender, ProfileValues } from '../../types';
import { sanitizeEmailPrefix } from '../../utils/account';
import { toGenderValue } from '../../utils/profile-goal';

export type UseProfileGoalFormResult = {
  profileValues: ProfileValues;
  setProfileValues: (values: ProfileValues | ((current: ProfileValues) => ProfileValues)) => void;
  gender: Gender;
  setGender: (value: Gender) => void;
  activityLevel: ActivityLevel;
  setActivityLevel: (value: ActivityLevel) => void;
  handleProfileValueChange: (field: keyof ProfileValues, value: string) => void;
  handleGenderChange: (value: Gender) => void;
  handleActivityChange: (value: ActivityLevel) => void;
};

type UseProfileGoalFormParams = {
  email: string | undefined;
};

export function useProfileGoalForm({
  email,
}: UseProfileGoalFormParams): UseProfileGoalFormResult {
  const [profileValues, setProfileValues] = useState<ProfileValues>({
    username: sanitizeEmailPrefix(email),
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

  function handleProfileValueChange(field: keyof ProfileValues, value: string): void {
    setProfileValues((current) => ({ ...current, [field]: value }));
  }

  function handleGenderChange(value: Gender): void {
    setGender(value);
  }

  function handleActivityChange(value: ActivityLevel): void {
    setActivityLevel(value);
  }

  return {
    profileValues,
    setProfileValues,
    gender,
    setGender,
    activityLevel,
    setActivityLevel,
    handleProfileValueChange,
    handleGenderChange,
    handleActivityChange,
  };
}
