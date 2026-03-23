/**
 * features/history/components/history-meal-list.tsx
 *
 * 【責務】
 * 指定日の Meal 一覧を描画し、各種操作ボタンを提供する。
 *
 * 【使用箇所】
 * - HistoryScreen
 *
 * 【やらないこと】
 * - Meal の状態更新
 *
 * 【他ファイルとの関係】
 * - history-meal-card を利用してカードを表示する。
 */

import { StyleSheet, Text, View } from 'react-native';

import { Meal } from '@/constants/schema';

import { HistoryMealCard } from './history-meal-card';

export type HistoryMealListProps = {
  meals: Meal[];
  onEdit: (meal: Meal) => void;
  onDelete: (mealId: string) => void;
  onSaveToLibrary: (meal: Meal) => void;
};

/**
 * MealCard の一覧。
 * 呼び出し元: HistoryScreen。
 */
export function HistoryMealList({ meals, onEdit, onDelete, onSaveToLibrary }: HistoryMealListProps) {
  if (meals.length === 0) {
    return (
      <View style={styles.emptyBox}>
        <Text style={styles.emptyText}>この日の記録はまだありません。</Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {meals.map((meal) => (
        <HistoryMealCard
          key={meal.id}
          meal={meal}
          onEdit={() => onEdit(meal)}
          onDelete={() => onDelete(meal.id)}
          onSave={() => onSaveToLibrary(meal)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 12,
  },
  emptyBox: {
    marginVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
  },
});
