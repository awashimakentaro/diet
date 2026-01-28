/**
 * components/food-item-editor-sheet.tsx
 *
 * 【責務】
 * 履歴/食品編集シート向けに FoodItem の編集 UI を提供し、PFC入力を反映する。
 *
 * 【使用箇所】
 * - features/history/components/edit-meal-modal
 * - features/foods/components/food-editor-modal
 *
 * 【やらないこと】
 * - 保存処理
 * - AI解析の実装
 *
 * 【他ファイルとの関係】
 * - constants/schema.ts の FoodItem 型を編集する。
 */

import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { FoodItem } from '@/constants/schema';
import { createId } from '@/lib/id';

export type FoodItemEditorSheetProps = {
  items: FoodItem[];
  onChange: (items: FoodItem[]) => void;
  onRequestAiAppend?: () => void;
};

/**
 * 履歴/食品編集用の FoodItem 編集リスト。
 * 呼び出し元: 各編集モーダル。
 * @param props アイテムと更新コールバック
 * @returns JSX.Element
 * @remarks 副作用は props のコールバック実行のみ。
 */
export function FoodItemEditorSheet({ items, onChange, onRequestAiAppend }: FoodItemEditorSheetProps) {
  /**
   * 指定インデックスのフィールド値を更新する。
   * 呼び出し元: 各入力フォーム。
   * @param index 編集対象の配列インデックス
   * @param key 更新する FoodItem のキー
   * @param value 入力値
   * @returns void
   * @remarks 副作用: onChange の呼び出し。
   */
  const handleChangeField = (index: number, key: keyof FoodItem, value: string) => {
    const next = items.map((item, idx) => {
      if (idx !== index) {
        return item;
      }
      if (key === 'name' || key === 'amount') {
        return { ...item, [key]: value };
      }
      const numeric = Number(value);
      return { ...item, [key]: Number.isFinite(numeric) ? numeric : 0 };
    });
    onChange(next);
  };

  /**
   * 指定インデックスの食品を削除する。
   * 呼び出し元: 削除ボタン。
   * @param index 削除対象インデックス
   * @returns void
   * @remarks 副作用: onChange の呼び出し。
   */
  const handleDelete = (index: number) => {
    const next = items.filter((_, idx) => idx !== index);
    onChange(next);
  };

  /**
   * 空の食品を末尾へ追加する。
   * 呼び出し元: handleAddButtonPress。
   * @returns void
   * @remarks 副作用: onChange の呼び出し。
   */
  const handleManualAdd = () => {
    const next: FoodItem = {
      id: createId('item'),
      name: '新しい食品',
      category: 'unknown',
      amount: '1人前',
      kcal: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
    };
    onChange([...items, next]);
  };

  /**
   * 追加ボタン押下時に追加方法を選択させる。
   * 呼び出し元: 追加ボタン onPress。
   * @returns void
   * @remarks 副作用: Alert 表示または onRequestAiAppend の実行。
   */
  const handleAddButtonPress = () => {
    if (!onRequestAiAppend) {
      handleManualAdd();
      return;
    }
    Alert.alert('食品を追加', '追加方法を選択してください。', [
      { text: 'AIで追加', onPress: onRequestAiAppend },
      { text: '手動で追加', onPress: handleManualAdd },
      { text: 'キャンセル', style: 'cancel' },
    ]);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.addRow}>
        <View style={styles.sectionLabelRow}>
          <View style={styles.sectionBar} />
          <Text style={styles.sectionTitle}>PFC構成</Text>
        </View>
        <Pressable style={styles.addButton} onPress={handleAddButtonPress} accessibilityRole="button">
          <MaterialIcons name="add" size={14} color="#2b7fff" />
          <Text style={styles.addLabel}>食品を追加</Text>
        </Pressable>
      </View>
      {items.map((item, index) => (
        <View key={item.id} style={styles.itemCard}>
          <View style={styles.itemHeader}>
            <View style={styles.itemTitleRow}>
              <View style={styles.itemIcon}>
                <MaterialIcons name="radio-button-unchecked" size={14} color="#155dfc" />
              </View>
              <TextInput
                style={styles.itemName}
                value={item.name}
                placeholder="食品名"
                onChangeText={(value) => handleChangeField(index, 'name', value)}
              />
            </View>
            <Pressable onPress={() => handleDelete(index)} accessibilityRole="button">
              <Text style={styles.deleteLabel}>削除</Text>
            </Pressable>
          </View>
          <TextInput
            style={styles.amountInput}
            value={item.amount}
            placeholder="量 (例: 1人前)"
            onChangeText={(value) => handleChangeField(index, 'amount', value)}
          />
          <View style={styles.macroRow}>
            <MacroBox label="Protein" color="#2b7fff" value={String(item.protein)} onChange={(value) => handleChangeField(index, 'protein', value)} />
            <MacroBox label="Fat" color="#f0b100" value={String(item.fat)} onChange={(value) => handleChangeField(index, 'fat', value)} />
            <MacroBox label="Carbs" color="#00c950" value={String(item.carbs)} onChange={(value) => handleChangeField(index, 'carbs', value)} />
            <MacroBox label="kcal" color="#101828" value={String(item.kcal)} onChange={(value) => handleChangeField(index, 'kcal', value)} tone="neutral" />
          </View>
        </View>
      ))}
    </View>
  );
}

type MacroBoxProps = {
  label: string;
  color: string;
  value: string;
  onChange: (value: string) => void;
  tone?: 'neutral' | 'accent';
};

/**
 * 栄養素の入力ボックスを描画する。
 * 呼び出し元: FoodItemEditorSheet。
 * @param props ラベルと入力値
 * @returns JSX.Element
 * @remarks 副作用は props のコールバック実行のみ。
 */
function MacroBox({ label, color, value, onChange, tone = 'accent' }: MacroBoxProps) {
  const labelStyle = tone === 'neutral' ? styles.macroLabelNeutral : styles.macroLabel;
  return (
    <View style={styles.macroBox}>
      <Text style={[labelStyle, { color }]}>{label}</Text>
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

const styles = StyleSheet.create({
  wrapper: {
    gap: 12,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#99a1af',
    letterSpacing: 1.2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2b7fff',
  },
  itemCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    padding: 20,
    gap: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  itemIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
    color: '#101828',
  },
  deleteLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ff6467',
  },
  amountInput: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#364153',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  macroRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  macroBox: {
    flexBasis: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  macroLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.2,
    marginBottom: 4,
  },
  macroLabelNeutral: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.2,
    marginBottom: 4,
  },
  macroInput: {
    fontSize: 16,
    fontWeight: '800',
    color: '#101828',
    width: '100%',
  },
});
