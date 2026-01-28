/**
 * features/foods/components/food-editor-modal.tsx
 *
 * 【責務】
 * 食品追加・編集フォームをモーダルで表示する。
 *
 * 【使用箇所】
 * - FoodsScreen
 *
 * 【やらないこと】
 * - バリデーション以外のビジネスロジック
 */

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { FoodItem } from '@/constants/schema';
import { FoodItemEditorSheet } from '@/components/food-item-editor-sheet';

export type FoodEditorModalProps = {
  visible: boolean;
  name: string;
  amount: string;
  calories: string;
  protein: string;
  fat: string;
  carbs: string;
  items: FoodItem[];
  onChangeName: (value: string) => void;
  onChangeAmount: (value: string) => void;
  onChangeCalories: (value: string) => void;
  onChangeProtein: (value: string) => void;
  onChangeFat: (value: string) => void;
  onChangeCarbs: (value: string) => void;
  onChangeItems: (items: FoodItem[]) => void;
  onRequestClose: () => void;
  onSubmit: () => void;
  onRequestAiAppend: () => void;
  title: string;
};

/**
 * 食品エントリ編集モーダル。
 */
export function FoodEditorModal({
  visible,
  name,
  amount,
  calories,
  protein,
  fat,
  carbs,
  items,
  onChangeName,
  onChangeAmount,
  onChangeCalories,
  onChangeProtein,
  onChangeFat,
  onChangeCarbs,
  onChangeItems,
  onRequestClose,
  onSubmit,
  onRequestAiAppend,
}: FoodEditorModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onRequestClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onRequestClose} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
          style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>記録を編集</Text>
            <Pressable style={styles.closeButton} onPress={onRequestClose} accessibilityRole="button">
              <MaterialIcons name="close" size={18} color="#9ca3af" />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <SectionLabel label="食品名" />
            <View style={styles.inputCard}>
              <TextInput
                style={styles.inputText}
                value={name}
                onChangeText={onChangeName}
                placeholder="食品名"
              />
            </View>
            <SectionLabel label="基準量とカロリー" />
            <View style={styles.baseRow}>
              <TextInput
                style={styles.baseAmount}
                value={amount}
                onChangeText={onChangeAmount}
                placeholder="1人前"
              />
              <View style={styles.baseDivider} />
              <View style={styles.baseKcalBlock}>
                <TextInput
                  style={styles.baseKcalValue}
                  value={calories}
                  onChangeText={onChangeCalories}
                  keyboardType="numeric"
                  textAlign="right"
                />
                <Text style={styles.baseKcalUnit}>kcal</Text>
              </View>
            </View>
            <FoodItemEditorSheet items={items} onChange={onChangeItems} onRequestAiAppend={onRequestAiAppend} />
            <HiddenMacroFields
              protein={protein}
              fat={fat}
              carbs={carbs}
              onChangeProtein={onChangeProtein}
              onChangeFat={onChangeFat}
              onChangeCarbs={onChangeCarbs}
            />
          </ScrollView>
          <View style={styles.footer}>
            <Pressable style={styles.saveButton} onPress={onSubmit} accessibilityRole="button">
              <Text style={styles.saveLabel}>保存</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

type SectionLabelProps = {
  label: string;
};

/**
 * セクションラベルを描画する。
 * 呼び出し元: FoodEditorModal。
 * @param props ラベル表示
 * @returns JSX.Element
 * @remarks 副作用は存在しない。
 */
function SectionLabel({ label }: SectionLabelProps) {
  return (
    <View style={styles.sectionLabelRow}>
      <View style={styles.sectionBar} />
      <Text style={styles.sectionLabelText}>{label}</Text>
    </View>
  );
}

type HiddenMacroFieldsProps = {
  protein: string;
  fat: string;
  carbs: string;
  onChangeProtein: (value: string) => void;
  onChangeFat: (value: string) => void;
  onChangeCarbs: (value: string) => void;
};

/**
 * 互換性維持のための非表示入力。
 * 呼び出し元: FoodEditorModal。
 * @param props マクロ値の更新
 * @returns JSX.Element
 * @remarks 副作用は props のコールバック実行のみ。
 */
function HiddenMacroFields({ protein, fat, carbs, onChangeProtein, onChangeFat, onChangeCarbs }: HiddenMacroFieldsProps) {
  return (
    <View style={styles.hiddenRow}>
      <TextInput value={protein} onChangeText={onChangeProtein} />
      <TextInput value={fat} onChangeText={onChangeFat} />
      <TextInput value={carbs} onChangeText={onChangeCarbs} />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    overflow: 'hidden',
    maxHeight: '92%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f9fafb',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#101828',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    gap: 20,
  },
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionBar: {
    width: 6,
    height: 24,
    borderRadius: 999,
    backgroundColor: '#2b7fff',
  },
  sectionLabelText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#99a1af',
    letterSpacing: 1.2,
  },
  inputCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 16,
  },
  inputText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#101828',
  },
  baseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 12,
  },
  baseAmount: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#364153',
  },
  baseDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#e5e7eb',
  },
  baseKcalBlock: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  baseKcalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#101828',
    minWidth: 50,
  },
  baseKcalUnit: {
    fontSize: 11,
    fontWeight: '800',
    color: '#99a1af',
    marginBottom: 2,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#f9fafb',
  },
  saveButton: {
    backgroundColor: '#155dfc',
    borderRadius: 32,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#dbeafe',
    shadowOpacity: 1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  saveLabel: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
  },
  hiddenRow: {
    height: 0,
    opacity: 0,
  },
});
