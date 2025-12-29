/**
 * app/(tabs)/foods.tsx
 *
 * 【責務】
 * 食品タブの UI を提供し、食品ライブラリの CRUD と RecordScreen への再利用を行う。
 *
 * 【使用箇所】
 * - TabLayout の `foods` ルート
 *
 * 【やらないこと】
 * - ライブラリ以外のデータ管理
 *
 * 【他ファイルとの関係】
 * - FoodLibraryAgent の API を呼び出す。
 */

import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { createDraftFromEntry, createEntry, deleteEntry, listEntries, refreshFoodLibrary, toMealDraft, updateEntry } from '@/agents/food-library-agent';
import { FoodItem, FoodLibraryEntry } from '@/constants/schema';
import { FoodItemEditor } from '@/components/food-item-editor';
import { useDietState } from '@/hooks/use-diet-state';
import { saveMeal } from '@/agents/save-meal-agent';

const typeFilters: Array<{ label: string; value: 'all' | 'single' | 'menu' }> = [
  { label: 'すべて', value: 'all' },
  { label: '単品', value: 'single' },
  { label: 'メニュー', value: 'menu' },
];

/**
 * 食品タブのメインコンポーネント。
 * @returns JSX.Element
 */
export default function FoodsScreen() {
  const router = useRouter();
  const libraryState = useDietState((state) => state.foodLibrary);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [filter, setFilter] = useState<'all' | 'single' | 'menu'>('all');
  const [editorVisible, setEditorVisible] = useState(false);
  const [editingEntry, setEditingEntry] = useState<FoodLibraryEntry | null>(null);
  const [formItems, setFormItems] = useState<FoodItem[]>([]);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('1人前');
  const [calories, setCalories] = useState('0');
  const [protein, setProtein] = useState('0');
  const [fat, setFat] = useState('0');
  const [carbs, setCarbs] = useState('0');

  const reloadLibrary = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshFoodLibrary();
    } catch (error) {
      console.warn(error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    reloadLibrary();
  }, [reloadLibrary]);

  useFocusEffect(
    useCallback(() => {
      reloadLibrary();
    }, [reloadLibrary]),
  );

  const filteredEntries = useMemo(() => {
    return listEntries({ keyword, type: filter });
  }, [libraryState, keyword, filter]);

  const openEditor = useCallback((entry?: FoodLibraryEntry) => {
    if (entry) {
      setEditingEntry(entry);
      setName(entry.name);
      setAmount(entry.amount);
      setCalories(String(entry.calories));
      setProtein(String(entry.protein));
      setFat(String(entry.fat));
      setCarbs(String(entry.carbs));
      setFormItems(entry.items.map((item) => ({ ...item })));
    } else {
      setEditingEntry(null);
      setName('');
      setAmount('1人前');
      setCalories('0');
      setProtein('0');
      setFat('0');
      setCarbs('0');
      setFormItems([]);
    }
    setEditorVisible(true);
  }, []);

  const handleSaveEntry = useCallback(async () => {
    const payload = {
      name,
      amount,
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
      fat: Number(fat) || 0,
      carbs: Number(carbs) || 0,
      items: formItems,
    };
    try {
      if (editingEntry) {
        await updateEntry(editingEntry.id, payload);
      } else {
        await createEntry(payload);
      }
      await reloadLibrary();
      setEditorVisible(false);
    } catch (error) {
      Alert.alert('保存に失敗しました', String((error as Error).message));
    }
  }, [editingEntry, name, amount, calories, protein, fat, carbs, formItems, reloadLibrary]);

  const handleDeleteEntry = useCallback((entryId: string) => {
    Alert.alert('削除しますか？', 'この食品を削除します。', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除',
        style: 'destructive',
        onPress: () =>
          deleteEntry(entryId)
            .then(() => reloadLibrary())
            .catch((error) => Alert.alert('削除失敗', String((error as Error).message))),
      },
    ]);
  }, [reloadLibrary]);

  const handleEatToday = useCallback(async (entryId: string) => {
    try {
      const draft = createDraftFromEntry(entryId);
      await saveMeal({ draft });
      Alert.alert('履歴に追加しました');
    } catch (error) {
      Alert.alert('追加できません', String((error as Error).message));
    }
  }, []);

  const handleOpenRecord = useCallback((entryId: string) => {
    try {
      toMealDraft(entryId);
      router.push('/(tabs)');
    } catch (error) {
      Alert.alert('開けません', String((error as Error).message));
    }
  }, [router]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="食品名を検索"
          value={keyword}
          onChangeText={setKeyword}
        />
        <Pressable style={styles.primaryButton} onPress={() => openEditor()}>
          <Text style={styles.primaryLabel}>追加</Text>
        </Pressable>
      </View>
      <View style={styles.filterRow}>
        {typeFilters.map((option) => (
          <Pressable
            key={option.value}
            style={[styles.chip, filter === option.value && styles.chipSelected]}
            onPress={() => setFilter(option.value)}>
            <Text style={[styles.chipLabel, filter === option.value && styles.chipLabelSelected]}>{option.label}</Text>
          </Pressable>
        ))}
      </View>
      <FlatList
        data={filteredEntries}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshing={isRefreshing}
        onRefresh={reloadLibrary}
        renderItem={({ item }) => (
          <View style={styles.entryCard}>
            <View style={styles.entryHeader}>
              <View>
                <Text style={styles.entryLabel}>{item.name}</Text>
                <Text style={styles.entryMeta}>{deriveTypeLabel(item)} / {item.items.length} 品</Text>
              </View>
              <Text style={styles.entryMeta}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
            <Text style={styles.entryMeta}>基準量: {item.amount} / {item.calories} kcal</Text>
            <View style={styles.entryActions}>
              <Pressable onPress={() => openEditor(item)}>
                <Text style={styles.link}>編集</Text>
              </Pressable>
              <Pressable onPress={() => handleDeleteEntry(item.id)}>
                <Text style={styles.danger}>削除</Text>
              </Pressable>
              <Pressable onPress={() => handleEatToday(item.id)}>
                <Text style={styles.link}>今日食べた</Text>
              </Pressable>
              <Pressable onPress={() => handleOpenRecord(item.id)}>
                <Text style={styles.link}>Record で開く</Text>
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>食品が登録されていません。</Text>}
      />

      <Modal visible={editorVisible} animationType="slide" onRequestClose={() => setEditorVisible(false)}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{editingEntry ? '食品を編集' : '食品を追加'}</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="表示名" />
          <TextInput style={styles.input} value={amount} onChangeText={setAmount} placeholder="量 (例: 1人前)" />
          <View style={styles.row}>
            <MacroField label="kcal" value={calories} onChange={setCalories} />
            <MacroField label="P" value={protein} onChange={setProtein} />
            <MacroField label="F" value={fat} onChange={setFat} />
            <MacroField label="C" value={carbs} onChange={setCarbs} />
          </View>
          <FoodItemEditor items={formItems} onChange={setFormItems} />
          <Pressable style={styles.primaryButton} onPress={handleSaveEntry}>
            <Text style={styles.primaryLabel}>保存</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={() => setEditorVisible(false)}>
            <Text style={styles.secondaryLabel}>閉じる</Text>
          </Pressable>
        </View>
      </Modal>
      </View>
    </SafeAreaView>
  );
}

type MacroFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

function MacroField({ label, value, onChange }: MacroFieldProps) {
  return (
    <View style={styles.macroField}>
      <Text style={styles.macroLabel}>{label}</Text>
      <TextInput style={styles.macroInput} keyboardType="numeric" value={value} onChangeText={onChange} />
    </View>
  );
}

function deriveTypeLabel(entry: FoodLibraryEntry): string {
  return entry.items.length > 1 ? 'メニュー' : '単品';
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
  },
  primaryButton: {
    backgroundColor: '#0a7ea4',
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: 8,
  },
  primaryLabel: {
    color: '#fff',
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  chipSelected: {
    backgroundColor: '#0a7ea4',
    borderColor: '#0a7ea4',
  },
  chipLabel: {
    color: '#555',
  },
  chipLabelSelected: {
    color: '#fff',
  },
  list: {
    paddingBottom: 120,
  },
  entryCard: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  entryLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  entryMeta: {
    color: '#666',
    marginBottom: 4,
  },
  entryActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  link: {
    color: '#0a7ea4',
    fontWeight: '600',
  },
  danger: {
    color: '#f06292',
    fontWeight: '600',
  },
  empty: {
    textAlign: 'center',
    color: '#666',
    marginTop: 40,
  },
  modalContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  macroField: {
    flex: 1,
  },
  macroLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  macroInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    textAlign: 'center',
  },
  secondaryButton: {
    padding: 12,
    alignItems: 'center',
  },
  secondaryLabel: {
    color: '#0a7ea4',
    fontWeight: '600',
  },
});
