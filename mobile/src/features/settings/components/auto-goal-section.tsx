/**
 * features/settings/components/auto-goal-section.tsx
 *
 * 【責務】
 * 体格情報の入力と自動計算の UI を提供する。
 *
 * 【使用箇所】
 * - SettingsScreen
 *
 * 【やらないこと】
 * - 計算ロジックの実装
 *
 * 【他ファイルとの関係】
 * - useSettingsScreen のフォーム状態を表示し、更新イベントを委譲する。
 */

import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AutoProfileForm } from '../use-settings-screen';
import { SectionCard } from './section-card';

export type AutoGoalSectionProps = {
  form: AutoProfileForm;
  onChangeField: <K extends keyof AutoProfileForm>(key: K, value: AutoProfileForm[K]) => void;
  onSaveProfile: () => void;
  onCalculate: () => void;
};

/**
 * 体格情報 + 自動計算セクションを描画する。
 * 呼び出し元: SettingsScreen。
 * @param props 入力値と保存/計算ハンドラ
 * @returns JSX.Element
 * @remarks 副作用は props のコールバック実行のみ。
 */
export function AutoGoalSection({ form, onChangeField, onSaveProfile, onCalculate }: AutoGoalSectionProps) {
  return (
    <SectionCard title="体格情報 + 自動計算">
      <GenderToggle value={form.gender} onChange={(value) => onChangeField('gender', value)} />
      <LabeledInlineInput
        label="年齢"
        unit="歳"
        value={String(form.age)}
        onChange={(value) => onChangeField('age', Number(value) || 0)}
      />
      <LabeledInlineInput
        label="身長"
        unit="cm"
        value={String(form.heightCm)}
        onChange={(value) => onChangeField('heightCm', Number(value) || 0)}
      />
      <LabeledInlineInput
        label="現在の体重"
        unit="kg"
        value={String(form.currentWeightKg)}
        onChange={(value) => onChangeField('currentWeightKg', Number(value) || 0)}
      />
      <LabeledInlineInput
        label="目標の体重"
        unit="kg"
        value={String(form.targetWeightKg)}
        onChange={(value) => onChangeField('targetWeightKg', Number(value) || 0)}
      />
      <LabeledInlineInput
        label="目標達成日数"
        unit="日"
        value={String(form.durationDays)}
        onChange={(value) => onChangeField('durationDays', Number(value) || 0)}
      />
      <ActivityLevelSelector value={form.activityLevel} onChange={(value) => onChangeField('activityLevel', value)} />
      <View style={styles.actionRow}>
        <Pressable style={styles.secondaryButton} onPress={onSaveProfile} accessibilityRole="button">
          <Text style={styles.secondaryLabel}>プロフィール保存</Text>
        </Pressable>
        <Pressable style={styles.primaryButton} onPress={onCalculate} accessibilityRole="button">
          <Text style={styles.primaryLabel}>自動計算実行</Text>
        </Pressable>
      </View>
    </SectionCard>
  );
}

type GenderToggleProps = {
  value: AutoProfileForm['gender'];
  onChange: (value: AutoProfileForm['gender']) => void;
};

/**
 * 性別のトグルボタンを描画する。
 * 呼び出し元: AutoGoalSection。
 * @param props 選択値と更新ハンドラ
 * @returns JSX.Element
 * @remarks 副作用は props のコールバック実行のみ。
 */
function GenderToggle({ value, onChange }: GenderToggleProps) {
  return (
    <View style={styles.genderToggle}>
      {([
        { label: '男性', value: 'male' },
        { label: '女性', value: 'female' },
      ] as const).map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            style={[styles.genderButton, active && styles.genderButtonActive]}
            onPress={() => onChange(option.value)}
            accessibilityRole="button">
            <Text style={[styles.genderLabel, active && styles.genderLabelActive]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

type LabeledInlineInputProps = {
  label: string;
  unit: string;
  value: string;
  onChange: (value: string) => void;
};

/**
 * ラベル付きの横並び数値入力を描画する。
 * 呼び出し元: AutoGoalSection。
 * @param props ラベル・単位・値・更新ハンドラ
 * @returns JSX.Element
 * @remarks 副作用は props のコールバック実行のみ。
 */
function LabeledInlineInput({ label, unit, value, onChange }: LabeledInlineInputProps) {
  return (
    <View style={styles.inlineRow}>
      <Text style={styles.inlineLabel}>{label}</Text>
      <View style={styles.inlineInputWrapper}>
        <TextInput style={styles.inlineInput} value={value} onChangeText={onChange} keyboardType="numeric" />
        <Text style={styles.inlineUnit}>{unit}</Text>
      </View>
    </View>
  );
}

type ActivityLevelSelectorProps = {
  value: AutoProfileForm['activityLevel'];
  onChange: (value: AutoProfileForm['activityLevel']) => void;
};

/**
 * 運動レベルの選択ボタンを描画する。
 * 呼び出し元: AutoGoalSection。
 * @param props 選択値と更新ハンドラ
 * @returns JSX.Element
 * @remarks 副作用は props のコールバック実行のみ。
 */
function ActivityLevelSelector({ value, onChange }: ActivityLevelSelectorProps) {
  const options = [
    { label: '低', value: 'low', subtitle: '座り仕事' },
    { label: '中', value: 'moderate', subtitle: '立ち仕事' },
    { label: '高', value: 'high', subtitle: '活発な運動' },
  ] as const;
  return (
    <View style={styles.activityWrapper}>
      <Text style={styles.activityLabel}>運動レベル</Text>
      <View style={styles.activityRow}>
        {options.map((option) => {
          const active = option.value === value;
          return (
            <Pressable
              key={option.value}
              style={[styles.activityButton, active && styles.activityButtonActive]}
              onPress={() => onChange(option.value)}
              accessibilityRole="button">
              <Text style={[styles.activityValue, active && styles.activityValueActive]}>{option.label}</Text>
              <Text style={[styles.activitySubtitle, active && styles.activityValueActive]}>{option.subtitle}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  genderToggle: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
  },
  genderButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
  },
  genderButtonActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  genderLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#99a1af',
  },
  genderLabelActive: {
    color: '#155dfc',
  },
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  inlineLabel: {
    width: 110,
    fontSize: 12,
    fontWeight: '800',
    color: '#6a7282',
  },
  inlineInputWrapper: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  inlineInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
    color: '#101828',
  },
  inlineUnit: {
    fontSize: 10,
    fontWeight: '800',
    color: '#d1d5dc',
  },
  activityWrapper: {
    marginBottom: 16,
  },
  activityLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#99a1af',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 8,
    paddingLeft: 4,
  },
  activityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  activityButton: {
    flex: 1,
    backgroundColor: 'rgba(249,250,251,0.5)',
    borderRadius: 16,
    paddingVertical: 10,
    alignItems: 'center',
  },
  activityButtonActive: {
    backgroundColor: '#ecfeff',
    borderWidth: 1,
    borderColor: '#a2f4fd',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  activityValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#99a1af',
  },
  activitySubtitle: {
    fontSize: 9,
    fontWeight: '700',
    color: '#99a1af',
  },
  activityValueActive: {
    color: '#155dfc',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#eff6ff',
    borderRadius: 16,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#155dfc',
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#155dfc',
    borderRadius: 16,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#cefafe',
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  primaryLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ffffff',
  },
});
