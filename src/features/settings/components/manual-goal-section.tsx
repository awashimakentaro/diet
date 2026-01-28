/**
 * features/settings/components/manual-goal-section.tsx
 *
 * 【責務】
 * 手動目標設定フォームを表示し、ユーザー入力値を受け付ける。
 *
 * 【使用箇所】
 * - SettingsScreen
 *
 * 【やらないこと】
 * - 目標値の保存処理
 *
 * 【他ファイルとの関係】
 * - useSettingsScreen が提供する値を入力欄へ反映する。
 */

import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { ManualGoalForm } from '../use-settings-screen';
import { SectionCard } from './section-card';

export type ManualGoalSectionProps = {
  form: ManualGoalForm;
  onChangeField: (key: keyof ManualGoalForm, value: string) => void;
  onSubmit: () => void;
};

/**
 * 手動目標設定セクションを描画する。
 * 呼び出し元: SettingsScreen。
 * @param props 入力値と更新/保存ハンドラ
 * @returns JSX.Element
 * @remarks 副作用は props のコールバック実行のみ。
 */
export function ManualGoalSection({ form, onChangeField, onSubmit }: ManualGoalSectionProps) {
  return (
    <SectionCard title="手動目標設定">
      <View style={styles.gridRow}>
        <ManualGoalInput
          label="KCAL"
          unit="kcal"
          value={form.kcal}
          onChange={(value) => onChangeField('kcal', value)}
        />
        <ManualGoalInput
          label="PROTEIN"
          unit="g"
          value={form.protein}
          onChange={(value) => onChangeField('protein', value)}
        />
      </View>
      <View style={styles.gridRow}>
        <ManualGoalInput label="FAT" unit="g" value={form.fat} onChange={(value) => onChangeField('fat', value)} />
        <ManualGoalInput
          label="CARBS"
          unit="g"
          value={form.carbs}
          onChange={(value) => onChangeField('carbs', value)}
        />
      </View>
      <Pressable style={styles.submitButton} onPress={onSubmit} accessibilityRole="button">
        <Text style={styles.submitLabel}>設定を更新する</Text>
      </Pressable>
    </SectionCard>
  );
}

type ManualGoalInputProps = {
  label: string;
  unit: string;
  value: string;
  onChange: (value: string) => void;
};

/**
 * 手動目標の数値入力を描画する。
 * 呼び出し元: ManualGoalSection。
 * @param props ラベル・単位・値・更新ハンドラ
 * @returns JSX.Element
 * @remarks 副作用は props のコールバック実行のみ。
 */
function ManualGoalInput({ label, unit, value, onChange }: ManualGoalInputProps) {
  return (
    <View style={styles.inputBlock}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <TextInput style={styles.input} keyboardType="numeric" value={value} onChangeText={onChange} />
        <Text style={styles.unit}>{unit}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  gridRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  inputBlock: {
    flex: 1,
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    color: '#99a1af',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 8,
    paddingLeft: 4,
  },
  inputWrapper: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 48,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
    color: '#101828',
  },
  unit: {
    fontSize: 10,
    fontWeight: '800',
    color: '#d1d5dc',
    textTransform: 'uppercase',
  },
  submitButton: {
    marginTop: 4,
    backgroundColor: '#101828',
    borderRadius: 16,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  submitLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
});
