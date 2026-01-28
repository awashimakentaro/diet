/**
 * features/record/components/record-draft-confirm-modal.tsx
 *
 * 【責務】
 * 解析結果や手動入力の Draft を確認・編集するモーダル UI を提供する。
 *
 * 【使用箇所】
 * - RecordScreen
 *
 * 【やらないこと】
 * - Draft の保存処理
 * - 解析ロジックの実行
 *
 * 【他ファイルとの関係】
 * - AnalyzeDraft を受け取り、編集結果を親へ返す。
 */

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { AnalyzeDraft, FoodItem } from '@/constants/schema';
import { createId } from '@/lib/id';

export type RecordDraftConfirmModalProps = {
  visible: boolean;
  draft: AnalyzeDraft | null;
  onChangeMenuName: (value: string) => void;
  onChangeItems: (items: FoodItem[]) => void;
  onRequestAddFood: (draftId: string) => void;
  onRequestClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
};

/**
 * Draft 確認モーダルを描画する。
 * 呼び出し元: RecordScreen。
 * @param props Draft 編集用の値とコールバック
 * @returns JSX.Element
 * @remarks 副作用は props のコールバック実行のみ。
 */
export function RecordDraftConfirmModal({
  visible,
  draft,
  onChangeMenuName,
  onChangeItems,
  onRequestAddFood,
  onRequestClose,
  onConfirm,
  isLoading,
}: RecordDraftConfirmModalProps) {
  if (!draft) {
    return null;
  }

  /**
   * FoodItem を削除する。
   * 呼び出し元: 削除ボタン。
   * @param index 削除対象インデックス
   * @returns void
   * @remarks 副作用: onChangeItems の呼び出し。
   */
  const handleRemoveItem = (index: number) => {
    const next = draft.items.filter((_, idx) => idx !== index);
    if (next.length === 0) {
      onChangeItems([createEmptyItem()]);
      return;
    }
    onChangeItems(next);
  };

  /**
   * 指定インデックスの FoodItem を更新する。
   * 呼び出し元: 各 TextInput。
   * @param index 対象インデックス
   * @param key 更新キー
   * @param value 入力値
   * @returns void
   * @remarks 副作用: onChangeItems の呼び出し。
   */
  const handleChangeItemField = (index: number, key: keyof FoodItem, value: string) => {
    const next = draft.items.map((item, idx) => {
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
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>入力内容の確認</Text>
            <Pressable style={styles.closeButton} onPress={onRequestClose} accessibilityRole="button">
              <MaterialIcons name="close" size={16} color="#9ca3af" />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>食事の名称</Text>
              <View style={styles.mealInputRow}>
                <MaterialIcons name="restaurant" size={18} color="#0092b8" />
                <TextInput
                  style={styles.mealInput}
                  value={draft.menuName}
                  onChangeText={onChangeMenuName}
                  placeholder="例: パワーランチ"
                  placeholderTextColor="#d1d5dc"
                />
              </View>
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>内訳の詳細</Text>
              {draft.items.map((item, index) => (
                <View key={item.id} style={styles.detailCard}>
                  <View style={styles.detailHeader}>
                    <View style={styles.indexBadge}>
                      <Text style={styles.indexLabel}>{index + 1}</Text>
                    </View>
                    <TextInput
                      style={styles.itemName}
                      value={item.name}
                      onChangeText={(value) => handleChangeItemField(index, 'name', value)}
                      placeholder="食品名"
                      placeholderTextColor="#d1d5dc"
                    />
                    <Pressable style={styles.itemDelete} onPress={() => handleRemoveItem(index)} accessibilityRole="button">
                      <MaterialIcons name="close" size={14} color="#ff6467" />
                    </Pressable>
                  </View>
                  <View style={styles.inlineRow}>
                    <LabeledField
                      label="分量"
                      value={item.amount}
                      placeholder="1人前"
                      onChange={(value) => handleChangeItemField(index, 'amount', value)}
                    />
                    <LabeledField
                      label="カロリー"
                      value={String(item.kcal)}
                      placeholder="0"
                      unit="kcal"
                      keyboardType="numeric"
                      onChange={(value) => handleChangeItemField(index, 'kcal', value)}
                    />
                  </View>
                  <View style={styles.macroRow}>
                    <MacroField
                      label="P"
                      labelColor="#0092b8"
                      labelBg="#ecfeff"
                      value={String(item.protein)}
                      onChange={(value) => handleChangeItemField(index, 'protein', value)}
                    />
                    <MacroField
                      label="F"
                      labelColor="#d08700"
                      labelBg="#fefce8"
                      value={String(item.fat)}
                      onChange={(value) => handleChangeItemField(index, 'fat', value)}
                    />
                    <MacroField
                      label="C"
                      labelColor="#00a63e"
                      labelBg="#f0fdf4"
                      value={String(item.carbs)}
                      onChange={(value) => handleChangeItemField(index, 'carbs', value)}
                    />
                  </View>
                </View>
              ))}
              <Pressable style={styles.addButton} onPress={() => onRequestAddFood(draft.draftId)} accessibilityRole="button">
                <MaterialIcons name="add" size={18} color="#99a1af" />
                <Text style={styles.addLabel}>別の食品を追加する</Text>
              </Pressable>
            </View>
          </ScrollView>
          <View style={styles.footer}>
            <Pressable style={styles.confirmButton} onPress={onConfirm} accessibilityRole="button">
              <Text style={styles.confirmLabel}>この内容で確定する</Text>
              <MaterialIcons name="check-circle" size={20} color="#ffffff" />
            </Pressable>
          </View>
          {isLoading ? (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#0092b8" />
              <Text style={styles.loadingText}>AIが食品を解析中...</Text>
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

type LabeledFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  unit?: string;
  keyboardType?: 'default' | 'numeric';
  onChange: (value: string) => void;
};

/**
 * ラベル付きの入力欄を描画する。
 * 呼び出し元: RecordDraftConfirmModal。
 * @param props 入力値とラベル
 * @returns JSX.Element
 * @remarks 副作用は props のコールバック実行のみ。
 */
function LabeledField({ label, value, placeholder, unit, keyboardType = 'default', onChange }: LabeledFieldProps) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.fieldInputRow}>
        <TextInput
          style={styles.fieldInput}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor="rgba(16,24,40,0.5)"
          keyboardType={keyboardType}
        />
        {unit ? <Text style={styles.unitLabel}>{unit}</Text> : null}
      </View>
    </View>
  );
}

type MacroFieldProps = {
  label: string;
  labelColor: string;
  labelBg: string;
  value: string;
  onChange: (value: string) => void;
};

/**
 * PFC 入力用の小コンポーネント。
 * 呼び出し元: RecordDraftConfirmModal。
 * @param props ラベルと入力値
 * @returns JSX.Element
 * @remarks 副作用は props のコールバック実行のみ。
 */
function MacroField({ label, labelColor, labelBg, value, onChange }: MacroFieldProps) {
  return (
    <View style={styles.macroBlock}>
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
      <Text style={styles.macroUnit}>g</Text>
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
 * 空の FoodItem を生成する。
 * 呼び出し元: handleRemoveItem。
 * @returns FoodItem
 * @remarks 副作用は存在しない。
 */
function createEmptyItem(): FoodItem {
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
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    width: '100%',
    maxHeight: '92%',
    backgroundColor: '#f9fafb',
    borderTopLeftRadius: 48,
    borderTopRightRadius: 48,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 25,
    shadowOffset: { width: 0, height: -10 },
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#101828',
  },
  closeButton: {
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  content: {
    paddingTop: 20,
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#99a1af',
    letterSpacing: 1.1,
    paddingLeft: 8,
  },
  mealInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    paddingHorizontal: 20,
    height: 68,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  mealInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: '#101828',
  },
  detailCard: {
    backgroundColor: '#ffffff',
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'rgba(243,244,246,0.5)',
    padding: 20,
    gap: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  indexBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ecfeff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  indexLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0092b8',
  },
  itemName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: '#101828',
  },
  itemDelete: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineRow: {
    flexDirection: 'row',
    gap: 12,
  },
  fieldBlock: {
    flex: 1,
    gap: 6,
  },
  fieldLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#99a1af',
  },
  fieldInputRow: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 44,
  },
  fieldInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#101828',
  },
  unitLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#d1d5dc',
    textTransform: 'uppercase',
  },
  macroRow: {
    flexDirection: 'row',
    gap: 10,
  },
  macroBlock: {
    flex: 1,
    gap: 8,
    alignItems: 'center',
  },
  macroBadge: {
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  macroBadgeLabel: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  macroInput: {
    width: '100%',
    backgroundColor: 'rgba(249,250,251,0.5)',
    borderRadius: 16,
    paddingVertical: 8,
    fontSize: 12,
    fontWeight: '800',
    color: '#101828',
  },
  macroUnit: {
    fontSize: 8,
    fontWeight: '800',
    color: '#d1d5dc',
  },
  addButton: {
    marginTop: 8,
    borderWidth: 2,
    borderColor: '#f3f4f6',
    borderRadius: 40,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#ffffff',
  },
  addLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#99a1af',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    backgroundColor: '#ffffff',
    paddingHorizontal: 32,
    paddingTop: 24,
    paddingBottom: 32,
  },
  confirmButton: {
    backgroundColor: '#0092b8',
    borderRadius: 24,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 12,
    shadowColor: 'rgba(16,78,100,0.2)',
    shadowOpacity: 1,
    shadowRadius: 25,
    shadowOffset: { width: 0, height: 12 },
    elevation: 4,
  },
  confirmLabel: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0092b8',
  },
});
