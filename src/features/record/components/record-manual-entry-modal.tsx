/**
 * features/record/components/record-manual-entry-modal.tsx
 *
 * 【責務】
 * 手動入力用のボトムシート UI を描画し、入力内容を親へ渡す。
 *
 * 【使用箇所】
 * - RecordScreen
 *
 * 【やらないこと】
 * - Draft 生成や保存などのロジック
 * - 入力値の状態管理
 *
 * 【他ファイルとの関係】
 * - RecordScreen から入力値とコールバックを受け取る。
 */

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { FoodItem } from '@/constants/schema';
import { createId } from '@/lib/id';

export type RecordManualEntryModalProps = {
  visible: boolean;
  menuName: string;
  items: FoodItem[];
  onChangeMenuName: (value: string) => void;
  onChangeItems: (items: FoodItem[]) => void;
  onRequestClose: () => void;
  onSubmit: () => void;
};

/**
 * 手動入力のモーダルを描画する。
 * 呼び出し元: RecordScreen。
 * @param props 入力値とコールバック
 * @returns JSX.Element
 * @remarks 副作用は props のコールバック実行のみ。
 */
export function RecordManualEntryModal({
  visible,
  menuName,
  items,
  onChangeMenuName,
  onChangeItems,
  onRequestClose,
  onSubmit,
}: RecordManualEntryModalProps) {
  const activeItem = items[0] ?? createFallbackItem();
  /**
   * 指定インデックスの入力値を更新する。
   * 呼び出し元: 各 TextInput。
   * @param index 対象インデックス
   * @param key 更新キー
   * @param value 入力値
   * @returns void
   * @remarks 副作用: onChangeItems の呼び出し。
   */
  const handleChangeItemField = (index: number, key: keyof FoodItem, value: string) => {
    if (items.length === 0 && index === 0) {
      const base: FoodItem = {
        ...activeItem,
        [key]: key === 'name' || key === 'amount' ? value : parseManualNumber(value),
      } as FoodItem;
      onChangeItems([base]);
      return;
    }
    const next = items.map((item, idx) => {
      if (idx !== index) {
        return item;
      }
      if (key === 'name' || key === 'amount') {
        return { ...item, [key]: value };
      }
      return { ...item, [key]: parseManualNumber(value) };
    });
    onChangeItems(next);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onRequestClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onRequestClose} />
        <View style={styles.centerCard}>
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>手動入力</Text>
            <Pressable style={styles.closeButton} onPress={onRequestClose} accessibilityRole="button">
              <MaterialIcons name="close" size={16} color="#9ca3af" />
            </Pressable>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>食事名</Text>
            <TextInput
              style={styles.titleInput}
              value={menuName}
              onChangeText={onChangeMenuName}
              placeholder="朝食、昼食など"
              placeholderTextColor="#e5e7eb"
            />
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>食品情報</Text>
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>食品名</Text>
              <TextInput
                style={styles.fieldInput}
                value={activeItem.name}
                onChangeText={(value) => handleChangeItemField(0, 'name', value)}
                placeholder="食品名を入力"
                placeholderTextColor="rgba(16,24,40,0.5)"
              />
            </View>
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>分量</Text>
              <TextInput
                style={styles.fieldInput}
                value={activeItem.amount}
                onChangeText={(value) => handleChangeItemField(0, 'amount', value)}
                placeholder="1人前"
                placeholderTextColor="rgba(16,24,40,0.5)"
              />
            </View>
            <View style={styles.macroRow}>
              <MacroInput
                label="KCAL"
                labelColor="#99a1af"
                labelBg="#f3f4f6"
                value={String(activeItem.kcal)}
                onChange={(value) => handleChangeItemField(0, 'kcal', value)}
              />
              <MacroInput
                label="P"
                labelColor="#0092b8"
                labelBg="#ecfeff"
                value={String(activeItem.protein)}
                onChange={(value) => handleChangeItemField(0, 'protein', value)}
              />
              <MacroInput
                label="F"
                labelColor="#d08700"
                labelBg="#fefce8"
                value={String(activeItem.fat)}
                onChange={(value) => handleChangeItemField(0, 'fat', value)}
              />
              <MacroInput
                label="C"
                labelColor="#00a63e"
                labelBg="#f0fdf4"
                value={String(activeItem.carbs)}
                onChange={(value) => handleChangeItemField(0, 'carbs', value)}
              />
            </View>
          </View>
          <View style={styles.footerRow}>
            <Pressable style={styles.cancelButton} onPress={onRequestClose} accessibilityRole="button">
              <Text style={styles.cancelLabel}>キャンセル</Text>
            </Pressable>
            <Pressable style={styles.saveButton} onPress={onSubmit} accessibilityRole="button">
              <MaterialIcons name="check-circle" size={18} color="#ffffff" />
              <Text style={styles.saveLabel}>保存</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

type MacroInputProps = {
  label: string;
  labelColor: string;
  labelBg: string;
  value: string;
  onChange: (value: string) => void;
};

/**
 * 栄養素入力用の小コンポーネント。
 * 呼び出し元: RecordManualEntryModal。
 * @param props ラベルと入力値
 * @returns JSX.Element
 * @remarks 副作用は props のコールバック実行のみ。
 */
function MacroInput({ label, labelColor, labelBg, value, onChange }: MacroInputProps) {
  return (
    <View style={styles.macroBox}>
      <View style={[styles.macroBadge, { backgroundColor: labelBg }]}>
        <Text style={[styles.macroBadgeLabel, { color: labelColor }]}>{label}</Text>
      </View>
      <TextInput
        style={styles.macroInput}
        value={value}
        onChangeText={onChange}
        keyboardType="numeric"
        textAlign="center"
      />
    </View>
  );
}

/**
 * 数値入力を安全に数値へ変換する。
 * 呼び出し元: handleChangeItemField。
 * @param value 入力文字列
 * @returns 数値 (不正値は 0)
 * @remarks 副作用は存在しない。
 */
function parseManualNumber(value: string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return 0;
  }
  return parsed;
}

/**
 * 空の入力用 FoodItem を生成する。
 * 呼び出し元: RecordManualEntryModal。
 * @returns FoodItem
 * @remarks 副作用は存在しない。
 */
function createFallbackItem(): FoodItem {
  return {
    id: createId('item'),
    name: '',
    category: 'unknown',
    amount: '1人前',
    kcal: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
  };
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  centerCard: {
    width: '86%',
    backgroundColor: '#ffffff',
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#101828',
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    gap: 12,
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#99a1af',
    letterSpacing: 1.1,
  },
  titleInput: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 18,
    fontWeight: '800',
    color: '#101828',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  fieldBlock: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0092b8',
    letterSpacing: 0.6,
  },
  fieldInput: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: '700',
    color: '#101828',
  },
  macroRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  macroBox: {
    flexBasis: '24%',
    gap: 6,
    alignItems: 'center',
  },
  macroBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  macroBadgeLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  macroInput: {
    backgroundColor: '#f9fafb',
    borderRadius: 14,
    paddingVertical: 8,
    fontSize: 12,
    fontWeight: '800',
    color: '#101828',
    width: '100%',
  },
  footerRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  cancelLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#99a1af',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#0092b8',
    borderRadius: 14,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: '#cefafe',
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  saveLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
});
