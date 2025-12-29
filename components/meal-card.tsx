/**
 * components/meal-card.tsx
 *
 * 【責務】
 * Meal 情報をカード形式で表示し、編集や削除などの操作ボタンを提供する。
 *
 * 【使用箇所】
 * - HistoryScreen
 * - FoodsScreen（複製などを行う場合）
 *
 * 【やらないこと】
 * - Meal の保存や削除ロジック
 *
 * 【他ファイルとの関係】
 * - constants/schema.ts の Meal 型をレンダリングする。
 */

import { ReactNode } from 'react';
import { StyleSheet, Text, View, ViewStyle, Pressable } from 'react-native';

import { Meal } from '@/constants/schema';
import { formatTime } from '@/lib/date';

export type MealCardProps = {
  meal: Meal;
  style?: ViewStyle;
  actions?: ReactNode;
};

/**
 * MealCard は単一 Meal を視覚化するコンポーネント。
 * 呼び出し元: HistoryScreen。
 * @param props Meal データとオプションのアクション群
 * @returns JSX.Element
 */
export function MealCard({ meal, style, actions }: MealCardProps) {
  return (
    <View style={[styles.card, style]}
      accessibilityRole="summary"
      accessibilityLabel={`${meal.menuName} ${Math.round(meal.totals.kcal)}キロカロリー`}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{meal.menuName}</Text>
          <Text style={styles.meta}>{formatTime(new Date(meal.recordedAt))} / {meal.source}</Text>
        </View>
        <Text style={styles.kcal}>{Math.round(meal.totals.kcal)} kcal</Text>
      </View>
      {meal.originalText ? <Text style={styles.original}>{meal.originalText}</Text> : null}
      {meal.items.map((item) => (
        <View key={item.id} style={styles.itemRow}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemAmount}>{item.amount}</Text>
          <Text style={styles.itemMacro}>{item.kcal} kcal</Text>
        </View>
      ))}
      {actions ? <View style={styles.actions}>{actions}</View> : null}
    </View>
  );
}

export type MealCardActionProps = {
  label: string;
  onPress: () => void;
};

/**
 * MealCardAction はカード下部に表示するシンプルなボタン。
 * 呼び出し元: MealCard。
 * @param props ラベルと onPress
 */
export function MealCardAction({ label, onPress }: MealCardActionProps) {
  return (
    <Pressable onPress={onPress} style={styles.actionButton} accessibilityRole="button">
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  meta: {
    fontSize: 12,
    color: '#666',
  },
  kcal: {
    fontSize: 16,
    fontWeight: '600',
  },
  original: {
    marginBottom: 8,
    color: '#555',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemName: {
    flex: 1,
    fontWeight: '500',
  },
  itemAmount: {
    width: 80,
    textAlign: 'right',
  },
  itemMacro: {
    width: 70,
    textAlign: 'right',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#0a7ea4',
  },
  actionLabel: {
    color: '#0a7ea4',
    fontWeight: '600',
  },
});
