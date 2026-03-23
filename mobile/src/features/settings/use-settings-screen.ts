/**
 * features/settings/use-settings-screen.ts
 *
 * 【責務】
 * 設定タブにおけるフォーム状態とハンドラをまとめ、UI コンポーネントから呼び出せるようにする。
 *
 * 【使用箇所】
 * - SettingsScreen
 *
 * 【やらないこと】
 * - JSX の描画
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';

import { applyCalculatedGoal, calculateGoalFromProfile, fetchGoal, setManualGoal } from '@/agents/goal-agent';
import { ProfileInput, saveProfile, toSnapshot } from '@/agents/profile-agent';
import { buildPayload, cancelAll, fetchNotificationSetting, requestPermission, updateSchedule } from '@/agents/notification-agent';
import { NotificationTime, Profile } from '@/constants/schema';
import { useDailySummary } from '@/hooks/use-daily-summary';
import { useDietState } from '@/hooks/use-diet-state';
import { getTodayKey } from '@/lib/date';
import { useAuth } from '@/providers/auth-provider';

export type ManualGoalForm = {
  kcal: string;
  protein: string;
  fat: string;
  carbs: string;
};

export type AutoProfileForm = {
  gender: 'male' | 'female';
  age: number;
  heightCm: number;
  currentWeightKg: number;
  targetWeightKg: number;
  durationDays: number;
  activityLevel: 'low' | 'moderate' | 'high';
};

const defaultAutoForm: AutoProfileForm = {
  gender: 'female',
  age: 30,
  heightCm: 160,
  currentWeightKg: 55,
  targetWeightKg: 52,
  durationDays: 60,
  activityLevel: 'moderate',
};

export type UseSettingsScreenResult = {
  summary: ReturnType<typeof useDailySummary>;
  manualForm: ManualGoalForm;
  updateManualField: (key: keyof ManualGoalForm, value: string) => void;
  handleManualSave: () => Promise<void>;
  profileForm: AutoProfileForm;
  updateProfileField: <K extends keyof AutoProfileForm>(key: K, value: AutoProfileForm[K]) => void;
  handleProfileSave: () => void;
  handleCalculate: () => void;
  calcPreview: string;
  notificationsEnabled: boolean;
  selectedTimes: NotificationTime[];
  handleToggleNotification: (value: boolean) => Promise<void>;
  toggleNotificationTime: (time: NotificationTime) => void;
  handleSaveNotification: () => Promise<void>;
  notificationPreviewBody: string;
  accountEmail: string;
  handleSignOut: () => void;
};

/**
 * 設定画面用フック。
 */
export function useSettingsScreen(): UseSettingsScreenResult {
  const todayKey = getTodayKey();
  const summary = useDailySummary(todayKey);
  const goal = useDietState((state) => state.goal);
  const profile = useDietState((state) => state.profile);
  const notification = useDietState((state) => state.notification);
  const { user, signOut } = useAuth();

  const [manualForm, setManualForm] = useState<ManualGoalForm>({ kcal: '', protein: '', fat: '', carbs: '' });
  const [profileForm, setProfileForm] = useState<AutoProfileForm>(() => toAutoForm(profile));
  const [calcPreview, setCalcPreview] = useState('未計算');
  const [notificationsEnabled, setNotificationsEnabled] = useState(notification.enabled);
  const [selectedTimes, setSelectedTimes] = useState<NotificationTime[]>(notification.times ?? ['midnight']);

  useEffect(() => {
    fetchGoal().catch((error) => console.warn(error));
    fetchNotificationSetting().catch((error) => console.warn(error));
  }, []);

  useEffect(() => {
    setManualForm({
      kcal: String(goal.kcal ?? 0),
      protein: String(goal.protein ?? 0),
      fat: String(goal.fat ?? 0),
      carbs: String(goal.carbs ?? 0),
    });
  }, [goal]);

  useEffect(() => {
    setProfileForm(toAutoForm(profile));
  }, [profile]);

  useEffect(() => {
    setNotificationsEnabled(notification.enabled);
    setSelectedTimes(notification.times ?? ['midnight']);
  }, [notification]);

  const notificationPreviewBody = useMemo(() => buildPayload(todayKey, summary).body, [summary, todayKey]);

  const updateManualField = useCallback((key: keyof ManualGoalForm, value: string) => {
    setManualForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const updateProfileField = useCallback(<K extends keyof AutoProfileForm>(key: K, value: AutoProfileForm[K]) => {
    setProfileForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleManualSave = useCallback(async () => {
    const macro = {
      kcal: Number(manualForm.kcal) || 0,
      protein: Number(manualForm.protein) || 0,
      fat: Number(manualForm.fat) || 0,
      carbs: Number(manualForm.carbs) || 0,
    };
    try {
      await setManualGoal(macro);
      Alert.alert('目標を更新しました');
    } catch (error) {
      Alert.alert('保存に失敗しました', String((error as Error).message));
    }
  }, [manualForm]);

  const handleProfileSave = useCallback(() => {
    try {
      saveProfile(buildProfileInput(profileForm));
      Alert.alert('プロフィールを保存しました');
    } catch (error) {
      Alert.alert('保存に失敗しました', String((error as Error).message));
    }
  }, [profileForm]);

  const handleCalculate = useCallback(() => {
    try {
      const saved = saveProfile(buildProfileInput(profileForm));
      const snapshot = toSnapshot(saved);
      const result = calculateGoalFromProfile(snapshot);
      setCalcPreview(`推奨 ${result.macro.kcal} kcal / P${result.macro.protein} F${result.macro.fat} C${result.macro.carbs}`);
      applyCalculatedGoal(result)
        .then(() => Alert.alert('自動計算で更新しました'))
        .catch((error) => Alert.alert('計算結果の保存に失敗しました', String((error as Error).message)));
    } catch (error) {
      Alert.alert('計算失敗', String((error as Error).message));
    }
  }, [profileForm]);

  const handleToggleNotification = useCallback(async (value: boolean) => {
    setNotificationsEnabled(value);
    if (value) {
      const granted = await requestPermission();
      if (!granted) {
        Alert.alert('権限が必要です');
        setNotificationsEnabled(false);
        return;
      }
      if (selectedTimes.length === 0) {
        setSelectedTimes(['midnight']);
      }
    }
  }, [selectedTimes.length]);

  const toggleNotificationTime = useCallback((time: NotificationTime) => {
    setSelectedTimes((prev) => {
      if (prev.includes(time)) {
        if (prev.length === 1) {
          return prev;
        }
        return prev.filter((value) => value !== time);
      }
      return [...prev, time];
    });
  }, []);

  const handleSaveNotification = useCallback(async () => {
    try {
      if (!notificationsEnabled) {
        await cancelAll();
        Alert.alert('通知を停止しました');
        return;
      }
      if (selectedTimes.length === 0) {
        Alert.alert('通知時間を選択してください');
        return;
      }
      await updateSchedule({
        ...notification,
        enabled: true,
        times: selectedTimes,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      Alert.alert('通知設定を更新しました');
    } catch (error) {
      Alert.alert('通知設定を保存できません', String((error as Error).message));
    }
  }, [notification, notificationsEnabled, selectedTimes]);

  const handleSignOut = useCallback(() => {
    Alert.alert('ログアウトしますか？', '他のユーザーで利用する場合はログアウトしてください。', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: 'ログアウト',
        style: 'destructive',
        onPress: () => {
          signOut().catch((error) => Alert.alert('ログアウトできません', String((error as Error).message)));
        },
      },
    ]);
  }, [signOut]);

  const accountEmail = user?.email ?? 'メールアドレス未設定';

  return {
    summary,
    manualForm,
    updateManualField,
    handleManualSave,
    profileForm,
    updateProfileField,
    handleProfileSave,
    handleCalculate,
    calcPreview,
    notificationsEnabled,
    selectedTimes,
    handleToggleNotification,
    toggleNotificationTime,
    handleSaveNotification,
    notificationPreviewBody,
    accountEmail,
    handleSignOut,
  };
}

function toAutoForm(profile: Profile | null): AutoProfileForm {
  if (!profile) {
    return defaultAutoForm;
  }
  const today = new Date();
  const birth = new Date(profile.birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const hasHadBirthday =
    today.getMonth() > birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());
  if (!hasHadBirthday) {
    age -= 1;
  }
  age = Math.max(10, age);
  const targetDate = new Date(profile.targetDate);
  const durationDays = Math.max(1, Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
  const gender = profile.gender === 'male' || profile.gender === 'female' ? profile.gender : 'female';
  return {
    gender,
    age,
    heightCm: profile.heightCm,
    currentWeightKg: profile.currentWeightKg,
    targetWeightKg: profile.targetWeightKg,
    durationDays,
    activityLevel: profile.activityLevel,
  };
}

function buildProfileInput(form: AutoProfileForm): ProfileInput {
  const today = new Date();
  const birthDate = new Date(today);
  birthDate.setFullYear(birthDate.getFullYear() - Math.max(10, form.age));
  const targetDate = new Date(today);
  targetDate.setDate(targetDate.getDate() + Math.max(1, form.durationDays));
  return {
    gender: form.gender,
    birthDate: birthDate.toISOString().slice(0, 10),
    heightCm: form.heightCm,
    currentWeightKg: form.currentWeightKg,
    targetWeightKg: form.targetWeightKg,
    targetDate: targetDate.toISOString().slice(0, 10),
    activityLevel: form.activityLevel,
  };
}
