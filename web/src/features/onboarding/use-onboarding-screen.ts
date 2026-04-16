'use client';

/**
 * web/src/features/onboarding/use-onboarding-screen.ts
 *
 * 【責務】
 * オンボーディング画面のプロフィール入力 state と保存処理をまとめる。
 *
 * 【使用されるエージェント / 処理フロー】
 * - web/src/app/setup/onboarding/_components/onboarding-page-screen.tsx から呼ばれる。
 * - 共通チュートリアル表示後にプロフィールを保存し、初期 goals を生成する。
 *
 * 【やらないこと】
 * - JSX 描画
 * - CSS 定義
 * - 認証レイアウトの制御
 *
 * 【他ファイルとの関係】
 * - settings/api 配下の取得保存処理と calculate-goal-from-profile.ts を利用する。
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useWebAuth } from '@/app/provider';

import { calculateGoalFromProfile } from '../settings/calculate-goal-from-profile';
import { getUserProfile } from '../settings/api/get-user-profile';
import { saveSettingsGoal } from '../settings/api/save-settings-goal';
import { saveUserProfile } from '../settings/api/save-user-profile';

type ActivityLevel = 'low' | 'moderate' | 'high';
type Gender = 'male' | 'female';

type OnboardingProfileValues = {
  username: string;
  displayName: string;
  bio: string;
  age: string;
  heightCm: string;
  currentWeightKg: string;
  targetWeightKg: string;
  targetDays: string;
};

type UseOnboardingScreenParams = {
  redirectTo: string;
};

type UseOnboardingScreenResult = {
  profileValues: OnboardingProfileValues;
  gender: Gender;
  activityLevel: ActivityLevel;
  feedbackMessage: string | null;
  isSubmitting: boolean;
  handleProfileValueChange: (field: keyof OnboardingProfileValues, value: string) => void;
  handleGenderChange: (value: Gender) => void;
  handleActivityChange: (value: ActivityLevel) => void;
  handleSubmitProfile: () => Promise<void>;
};

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

export function useOnboardingScreen({
  redirectTo,
}: UseOnboardingScreenParams): UseOnboardingScreenResult {
  const router = useRouter();
  const { user } = useWebAuth();
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gender, setGender] = useState<Gender>('male');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate');
  const [profileValues, setProfileValues] = useState<OnboardingProfileValues>({
    username: sanitizeEmailPrefix(user?.email),
    displayName: '',
    bio: '',
    age: '30',
    heightCm: '170',
    currentWeightKg: '65',
    targetWeightKg: '62',
    targetDays: '84',
  });

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    let isMounted = true;

    async function ensureOnboardingNeed(): Promise<void> {
      try {
        const profile = await getUserProfile();

        if (!isMounted) {
          return;
        }

        if (profile !== null) {
          router.replace(redirectTo);
          return;
        }

        setProfileValues((current) => ({
          ...current,
          username: sanitizeEmailPrefix(user?.email),
        }));
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setFeedbackMessage(error instanceof Error ? error.message : 'プロフィールの確認に失敗しました。');
      }
    }

    void ensureOnboardingNeed();

    return () => {
      isMounted = false;
    };
  }, [redirectTo, router, user?.email, user?.id]);

  function handleProfileValueChange(field: keyof OnboardingProfileValues, value: string): void {
    setProfileValues((current) => ({ ...current, [field]: value }));
  }

  function handleGenderChange(value: Gender): void {
    setGender(value);
  }

  function handleActivityChange(value: ActivityLevel): void {
    setActivityLevel(value);
  }

  async function handleSubmitProfile(): Promise<void> {
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

    setIsSubmitting(true);
    setFeedbackMessage(null);

    try {
      const goal = calculateGoalFromProfile({
        age,
        heightCm,
        currentWeightKg,
        targetWeightKg,
        gender,
        activityLevel,
      });

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

      await saveSettingsGoal(goal);
      router.replace(redirectTo);
    } catch (error) {
      setFeedbackMessage(error instanceof Error ? error.message : 'プロフィールの保存に失敗しました。');
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    profileValues,
    gender,
    activityLevel,
    feedbackMessage,
    isSubmitting,
    handleProfileValueChange,
    handleGenderChange,
    handleActivityChange,
    handleSubmitProfile,
  };
}
