/**
 * components/food-item-editor.tsx
 *
 * 【責務】
 * FoodItem の配列を編集するフォーム UI を提供する。
 *
 * 【使用箇所】
 * - RecordScreen
 * - HistoryScreen
 * - FoodsScreen のフォーム
 *
 * 【やらないこと】
 * - データ保存
 * - ID 採番
 *
 * 【他ファイルとの関係】
 * - constants/schema.ts の FoodItem 型を編集する。
 */

import { memo } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { FoodItem } from '@/constants/schema';
import { createId } from '@/lib/id';

export type FoodItemEditorProps = {
  items: FoodItem[];
  onChange: (items: FoodItem[]) => void;
};

/**
 * FoodItemEditor は食品カードを編集・追加・削除できるフォームコンポーネント。
 * 呼び出し元: 各スクリーン。
 * @param props 編集対象アイテムと onChange
 */
export const FoodItemEditor = memo(function FoodItemEditorBase({ items, onChange }: FoodItemEditorProps) {
  const handleChangeField = (index: number, key: keyof FoodItem, value: string) => {
    const next = items.map((item, idx) => (idx === index ? { ...item, [key]: key === 'name' || key === 'amount' ? value : Number(value) } : item));
    onChange(next);
  };

  const handleDelete = (index: number) => {
    const next = items.filter((_, idx) => idx !== index);
    onChange(next);
  };

  const handleAdd = () => {
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

  return (
    <View>
      {items.map((item, index) => (
        <View key={item.id} style={styles.itemCard}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemTitle}>{item.name || `食品 ${index + 1}`}</Text>
            <Pressable onPress={() => handleDelete(index)}>
              <Text style={styles.delete}>削除</Text>
            </Pressable>
          </View>
          <TextInput
            style={styles.input}
            value={item.name}
            placeholder="食品名"
            onChangeText={(value) => handleChangeField(index, 'name', value)}
          />
          <TextInput
            style={styles.input}
            value={item.amount}
            placeholder="量 (例: 1皿)"
            onChangeText={(value) => handleChangeField(index, 'amount', value)}
          />
          <View style={styles.row}>
            <MacroInput label="kcal" value={String(item.kcal)} onChange={(value) => handleChangeField(index, 'kcal', value)} />
            <MacroInput label="P" value={String(item.protein)} onChange={(value) => handleChangeField(index, 'protein', value)} />
            <MacroInput label="F" value={String(item.fat)} onChange={(value) => handleChangeField(index, 'fat', value)} />
            <MacroInput label="C" value={String(item.carbs)} onChange={(value) => handleChangeField(index, 'carbs', value)} />
          </View>
        </View>
      ))}
      <Pressable style={styles.addButton} onPress={handleAdd}>
        <Text style={styles.addLabel}>食品を追加</Text>
      </Pressable>
    </View>
  );
});

type MacroInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

function MacroInput({ label, value, onChange }: MacroInputProps) {
  return (
    <View style={styles.macroInput}>
      <Text style={styles.macroLabel}>{label}</Text>
      <TextInput
        style={styles.macroField}
        keyboardType="numeric"
        value={value}
        onChangeText={onChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  itemCard: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemTitle: {
    fontWeight: '600',
  },
  delete: {
    color: '#f06292',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  macroInput: {
    flex: 1,
  },
  macroLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  macroField: {
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 6,
    padding: 6,
    textAlign: 'center',
  },
  addButton: {
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0a7ea4',
    borderRadius: 8,
  },
  addLabel: {
    color: '#0a7ea4',
    fontWeight: '600',
  },
});
