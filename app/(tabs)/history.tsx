/**
 * app/(tabs)/history.tsx
 *
 * 【責務】
 * 履歴タブの UI を提供し、日付ごとの Meal 操作（閲覧・編集・削除・複製・食品保存）を実行する。
 *
 * 【使用箇所】
 * - TabLayout の `history` ルート
 *
 * 【やらないこと】
 * - サマリー計算
 * - 永続化
 *
 * 【他ファイルとの関係】
 * - HistoryAgent などのドメインロジックを呼び出す。
 */

import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { deleteMeal, deleteMealsByDate, updateMeal, syncMealsByDate } from '@/agents/history-agent';
import { useDailySummary } from '@/hooks/use-daily-summary';
import { MealCard, MealCardAction } from '@/components/meal-card';
import { SummaryCard } from '@/components/summary-card';
import { FoodItemEditor } from '@/components/food-item-editor';
import { FoodItem, Meal } from '@/constants/schema';
import { createEntry } from '@/agents/food-library-agent';
import { getTodayKey, shiftDateKey } from '@/lib/date';

/**
 * 履歴タブのメインコンポーネント。
 * @returns JSX.Element
 */
export default function HistoryScreen() {
  const [dateKey, setDateKey] = useState(getTodayKey());
  const summary = useDailySummary(dateKey);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [editingItems, setEditingItems] = useState<FoodItem[]>([]);
  const [editingMenuName, setEditingMenuName] = useState('');
  const [editingOriginal, setEditingOriginal] = useState('');

  useFocusEffect(
    useCallback(() => {
      syncMealsByDate(dateKey)
        .then(setMeals)
        .catch((error) => console.warn(error));
    }, [dateKey]),
  );

  const handleOpenEdit = useCallback((meal: Meal) => {
    setEditingMeal(meal);
    setEditingItems(meal.items.map((item) => ({ ...item })));
    setEditingMenuName(meal.menuName);
    setEditingOriginal(meal.originalText);
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editingMeal) {
      return;
    }
    try {
      await updateMeal(editingMeal.id, {
        menuName: editingMenuName,
        originalText: editingOriginal,
        items: editingItems,
      });
      const refreshed = await syncMealsByDate(dateKey);
      setMeals(refreshed);
      setEditingMeal(null);
    } catch (error) {
      Alert.alert('更新できません', String((error as Error).message));
    }
  }, [editingMeal, editingMenuName, editingOriginal, editingItems, dateKey]);

  const handleDeleteMeal = useCallback((mealId: string) => {
    Alert.alert('削除しますか？', 'この操作は取り消せません。', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除',
        style: 'destructive',
        onPress: () =>
          deleteMeal(mealId)
            .then(() => syncMealsByDate(dateKey))
            .then((result) => setMeals(result))
            .catch((error) => Alert.alert('削除できません', String((error as Error).message))),
      },
    ]);
  }, [dateKey]);

  const handleDeleteAll = useCallback(() => {
    Alert.alert(`${dateKey} を削除`, 'この日の記録をすべて削除しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除',
        style: 'destructive',
        onPress: () =>
          deleteMealsByDate(dateKey)
            .then(() => syncMealsByDate(dateKey))
            .then((result) => setMeals(result))
            .catch((error) => Alert.alert('削除できません', String((error as Error).message))),
      },
    ]);
  }, [dateKey]);

  const handleSaveToLibrary = useCallback((meal: Meal) => {
    createEntry({
      name: meal.menuName,
      amount: '1人前',
      calories: meal.totals.kcal,
      protein: meal.totals.protein,
      fat: meal.totals.fat,
      carbs: meal.totals.carbs,
      items: meal.items,
    })
      .then(() => Alert.alert('ライブラリに保存しました'))
      .catch((error) => Alert.alert('保存失敗', String((error as Error).message)));
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.dateRow}>
        <Pressable onPress={() => setDateKey((prev) => shiftDateKey(prev, -1))} style={styles.navButton}>
          <Text style={styles.navLabel}>前日</Text>
        </Pressable>
        <Text style={styles.dateLabel}>{dateKey}</Text>
        <Pressable onPress={() => setDateKey((prev) => shiftDateKey(prev, 1))} style={styles.navButton}>
          <Text style={styles.navLabel}>翌日</Text>
        </Pressable>
      </View>

      <SummaryCard summary={summary} />

      {meals.length === 0 ? (
        <Text style={styles.empty}>この日の記録はまだありません。</Text>
      ) : (
        meals.map((meal) => (
          <MealCard
            key={meal.id}
            meal={meal}
            actions={
              <>
                <MealCardAction label="編集" onPress={() => handleOpenEdit(meal)} />
                <MealCardAction label="削除" onPress={() => handleDeleteMeal(meal.id)} />
                <MealCardAction label="食品に保存" onPress={() => handleSaveToLibrary(meal)} />
              </>
            }
          />
        ))
      )}

      <Pressable style={styles.bulkDeleteButton} onPress={handleDeleteAll}>
        <Text style={styles.bulkDeleteLabel}>この日の記録をすべて削除</Text>
      </Pressable>

      <Modal visible={Boolean(editingMeal)} animationType="slide" onRequestClose={() => setEditingMeal(null)}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>記録を編集</Text>
          <TextInput style={styles.input} value={editingMenuName} onChangeText={setEditingMenuName} placeholder="メニュー名" />
          <TextInput
            style={[styles.input, styles.textArea]}
            value={editingOriginal}
            onChangeText={setEditingOriginal}
            placeholder="元テキスト"
            multiline
          />
          <FoodItemEditor items={editingItems} onChange={setEditingItems} />
          <Pressable style={styles.primaryButton} onPress={handleSaveEdit}>
            <Text style={styles.primaryLabel}>保存</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={() => setEditingMeal(null)}>
            <Text style={styles.secondaryLabel}>閉じる</Text>
          </Pressable>
        </View>
      </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    padding: 16,
    paddingTop: 24,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  navButton: {
    padding: 8,
  },
  navLabel: {
    color: '#0a7ea4',
    fontWeight: '600',
  },
  dateLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  empty: {
    textAlign: 'center',
    marginVertical: 32,
    color: '#666',
  },
  bulkDeleteButton: {
    borderWidth: 1,
    borderColor: '#f06292',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  bulkDeleteLabel: {
    color: '#f06292',
    fontWeight: '600',
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
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  primaryButton: {
    backgroundColor: '#0a7ea4',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryLabel: {
    color: '#fff',
    fontWeight: '600',
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
