/**
 * app/(tabs)/settings.tsx
 *
 * 【責務】
 * 設定タブの UI を提供し、目標値・プロフィール・通知の設定を操作できるようにする。
 *
 * 【使用箇所】
 * - TabLayout の `settings` ルート
 *
 * 【やらないこと】
 * - サマリー計算
 *
 * 【他ファイルとの関係】
 * - GoalAgent / ProfileAgent / NotificationAgent を呼び出す。
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SummaryCard } from '@/components/summary-card';
import { useDailySummary } from '@/hooks/use-daily-summary';
import { getTodayKey } from '@/lib/date';
import { useDietState } from '@/hooks/use-diet-state';
import { Goal, Profile } from '@/constants/schema';
import { applyCalculatedGoal, calculateGoalFromProfile, fetchGoal, setManualGoal } from '@/agents/goal-agent';
import { ProfileInput, saveProfile, toSnapshot } from '@/agents/profile-agent';
import { buildPayload, cancelAll, fetchNotificationSetting, getNotificationSetting, requestPermission, updateSchedule } from '@/agents/notification-agent';

type AutoProfileForm = {
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

/**
 * 設定タブのメインコンポーネント。
 * @returns JSX.Element
 */
export default function SettingsScreen() {
  const todayKey = getTodayKey();
  const summary = useDailySummary(todayKey);
  const goal = useDietState((state) => state.goal);
  const profile = useDietState((state) => state.profile);
  const notification = useDietState((state) => state.notification);

  const [manualForm, setManualForm] = useState({ kcal: '', protein: '', fat: '', carbs: '' });
  const [profileForm, setProfileForm] = useState<AutoProfileForm>(() => toAutoForm(profile));
  const [calcPreview, setCalcPreview] = useState<string>('未計算');
  const [notificationsEnabled, setNotificationsEnabled] = useState(notification.enabled);

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
  }, [notification]);

  const notificationPreview = useMemo(() => buildPayload(todayKey, summary), [summary, todayKey]);

  const handleManualSave = async () => {
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
  };

  const handleProfileSave = () => {
    try {
      saveProfile(buildProfileInput(profileForm));
      Alert.alert('プロフィールを保存しました');
    } catch (error) {
      Alert.alert('保存に失敗しました', String((error as Error).message));
    }
  };

  const handleCalculate = () => {
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
  };

  const handleToggleNotification = async (value: boolean) => {
    setNotificationsEnabled(value);
    if (value) {
      const granted = await requestPermission();
      if (!granted) {
        Alert.alert('権限が必要です');
        setNotificationsEnabled(false);
        return;
      }
      await updateSchedule({ ...getNotificationSetting(), enabled: true });
    } else {
      await cancelAll();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <SummaryCard summary={summary} />

      <Section title="手動目標設定">
        <MacroInputRow label="kcal" value={manualForm.kcal} onChange={(value) => setManualForm((prev) => ({ ...prev, kcal: value }))} />
        <MacroInputRow label="P" value={manualForm.protein} onChange={(value) => setManualForm((prev) => ({ ...prev, protein: value }))} />
        <MacroInputRow label="F" value={manualForm.fat} onChange={(value) => setManualForm((prev) => ({ ...prev, fat: value }))} />
        <MacroInputRow label="C" value={manualForm.carbs} onChange={(value) => setManualForm((prev) => ({ ...prev, carbs: value }))} />
        <PrimaryButton label="保存" onPress={handleManualSave} />
      </Section>

      <Section title="体格情報 + 自動計算">
        <GenderSelector value={profileForm.gender} onChange={(value) => setProfileForm((prev) => ({ ...prev, gender: value }))} />
        <LabeledInput label="年齢" value={String(profileForm.age)} keyboardType="numeric" onChangeText={(value) => setProfileForm((prev) => ({ ...prev, age: Number(value) || 0 }))} />
        <LabeledInput label="身長(cm)" value={String(profileForm.heightCm)} keyboardType="numeric" onChangeText={(value) => setProfileForm((prev) => ({ ...prev, heightCm: Number(value) || 0 }))} />
        <LabeledInput label="現在体重(kg)" value={String(profileForm.currentWeightKg)} keyboardType="numeric" onChangeText={(value) => setProfileForm((prev) => ({ ...prev, currentWeightKg: Number(value) || 0 }))} />
        <LabeledInput label="目標体重(kg)" value={String(profileForm.targetWeightKg)} keyboardType="numeric" onChangeText={(value) => setProfileForm((prev) => ({ ...prev, targetWeightKg: Number(value) || 0 }))} />
        <LabeledInput label="達成までの日数" value={String(profileForm.durationDays)} keyboardType="numeric" onChangeText={(value) => setProfileForm((prev) => ({ ...prev, durationDays: Number(value) || 0 }))} />
        <ActivitySelector value={profileForm.activityLevel} onChange={(value) => setProfileForm((prev) => ({ ...prev, activityLevel: value }))} />
        <PrimaryButton label="プロフィールを保存" onPress={handleProfileSave} />
        <PrimaryButton label="自動計算" onPress={handleCalculate} />
        <Text style={styles.preview}>{calcPreview}</Text>
      </Section>

      <Section title="通知設定">
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>0時の過不足通知</Text>
          <Switch value={notificationsEnabled} onValueChange={handleToggleNotification} />
        </View>
        <Text style={styles.preview}>{notificationPreview.body}</Text>
      </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

type SectionProps = {
  title: string;
  children: React.ReactNode;
};

/**
 * Section は設定項目をグルーピングするラッパー。
 * @param props タイトルと子要素
 */
function Section({ title, children }: SectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

type MacroInputRowProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

/**
 * MacroInputRow は栄養素の入力フィールド。
 * @param props ラベルとバリュー
 */
function MacroInputRow({ label, value, onChange }: MacroInputRowProps) {
  return (
    <View style={styles.inputRow}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput style={styles.inputField} keyboardType="numeric" value={value} onChangeText={onChange} />
    </View>
  );
}

type LabeledInputProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: 'numeric' | 'default';
};

/**
 * LabeledInput は 1 行のラベル付き入力欄。
 * @param props label/value/onChange
 */
function LabeledInput({ label, value, onChangeText, keyboardType = 'default' }: LabeledInputProps) {
  return (
    <View style={styles.inputRow}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput style={styles.inputField} value={value} onChangeText={onChangeText} keyboardType={keyboardType} />
    </View>
  );
}

type SelectorProps<T extends string> = {
  options: Array<{ label: string; value: T; subtitle?: string }>;
  value: T;
  onChange: (value: T) => void;
};

function Selector<T extends string>({ options, value, onChange }: SelectorProps<T>) {
  return (
    <View style={styles.selectorRow}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            style={[styles.selectorButton, active && styles.selectorButtonActive]}
            onPress={() => onChange(option.value)}>
            <Text style={[styles.selectorLabel, active && styles.selectorLabelActive]}>{option.label}</Text>
            {option.subtitle ? <Text style={[styles.selectorLabel, active && styles.selectorLabelActive]}>{option.subtitle}</Text> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

type GenderSelectorProps = {
  value: 'male' | 'female';
  onChange: (value: 'male' | 'female') => void;
};

function GenderSelector({ value, onChange }: GenderSelectorProps) {
  return (
    <Selector
      value={value}
      onChange={onChange}
      options={[
        { label: '男性', value: 'male' },
        { label: '女性', value: 'female' },
      ]}
    />
  );
}

type ActivitySelectorProps = {
  value: 'low' | 'moderate' | 'high';
  onChange: (value: 'low' | 'moderate' | 'high') => void;
};

function ActivitySelector({ value, onChange }: ActivitySelectorProps) {
  return (
    <Selector
      value={value}
      onChange={onChange}
      options={[
        { label: '低', value: 'low', subtitle: 'デスクワーク' },
        { label: '中', value: 'moderate', subtitle: '軽い運動' },
        { label: '高', value: 'high', subtitle: '激しい運動' },
      ]}
    />
  );
}

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
};

/**
 * PrimaryButton は青色のアクションボタン。
 * @param props label/onPress
 */
function PrimaryButton({ label, onPress }: PrimaryButtonProps) {
  return (
    <Pressable style={styles.primaryButton} onPress={onPress} accessibilityRole="button">
      <Text style={styles.primaryButtonLabel}>{label}</Text>
    </Pressable>
  );
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    padding: 16,
    gap: 16,
    paddingTop: 24,
  },
  section: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    width: 120,
    fontWeight: '500',
  },
  inputField: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
  },
  selectorRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  selectorButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    alignItems: 'center',
  },
  selectorButtonActive: {
    backgroundColor: '#0a7ea4',
    borderColor: '#0a7ea4',
  },
  selectorLabel: {
    fontWeight: '600',
    color: '#555',
  },
  selectorLabelActive: {
    color: '#fff',
  },
  primaryButton: {
    marginTop: 8,
    backgroundColor: '#0a7ea4',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonLabel: {
    color: '#fff',
    fontWeight: '600',
  },
  preview: {
    marginTop: 8,
    color: '#555',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    fontWeight: '600',
  },
});
