/**
 * features/history/components/edit-meal-modal.tsx
 *
 * 【責務】
 * 履歴の Meal 編集フォームをモーダルで表示し、入力 UI を提供する。
 *
 * 【使用箇所】
 * - HistoryScreen
 *
 * 【やらないこと】
 * - 保存ロジックや state 更新
 *
 * 【他ファイルとの関係】
 * - components/food-item-editor-sheet を利用して食品リストを編集する。
 */

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { FoodItem } from '@/constants/schema';
import { FoodItemEditorSheet } from '@/components/food-item-editor-sheet';

export type EditMealModalProps = {
  visible: boolean;
  menuName: string;
  originalText: string;
  items: FoodItem[];
  onChangeMenuName: (value: string) => void;
  onChangeOriginalText: (value: string) => void;
  onChangeItems: (items: FoodItem[]) => void;
  onRequestClose: () => void;
  onSubmit: () => void;
  onRequestAiAppend: () => void;
};

/**
 * Meal 編集モーダル。
 * 呼び出し元: HistoryScreen。
 */
export function EditMealModal({
  visible,
  menuName,
  originalText,
  items,
  onChangeMenuName,
  onChangeOriginalText,
  onChangeItems,
  onRequestClose,
  onSubmit,
  onRequestAiAppend,
}: EditMealModalProps) {
  const summary = buildMealSummary(items);

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
                value={menuName}
                onChangeText={onChangeMenuName}
                placeholder="食品名"
              />
            </View>
            <SectionLabel label="基準量とカロリー" />
            <View style={styles.baseRow}>
              <Text style={styles.baseAmount}>{summary.amount}</Text>
              <View style={styles.baseDivider} />
              <View style={styles.baseKcalBlock}>
                <Text style={styles.baseKcalValue}>{summary.kcal}</Text>
                <Text style={styles.baseKcalUnit}>kcal</Text>
              </View>
            </View>
            <FoodItemEditorSheet items={items} onChange={onChangeItems} onRequestAiAppend={onRequestAiAppend} />
            <TextInput
              style={styles.hiddenOriginal}
              value={originalText}
              onChangeText={onChangeOriginalText}
              editable={false}
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
 * 呼び出し元: EditMealModal。
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

type MealSummary = {
  amount: string;
  kcal: number;
};

/**
 * 編集画面用の表示サマリーを生成する。
 * 呼び出し元: EditMealModal。
 * @param items FoodItem 配列
 * @returns サマリー情報
 * @remarks 副作用は存在しない。
 */
function buildMealSummary(items: FoodItem[]): MealSummary {
  const totalKcal = items.reduce((sum, item) => sum + item.kcal, 0);
  const fallbackAmount = items[0]?.amount || '1人前';
  return { amount: fallbackAmount, kcal: Math.round(totalKcal) };
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
  hiddenOriginal: {
    height: 0,
    opacity: 0,
  },
});
