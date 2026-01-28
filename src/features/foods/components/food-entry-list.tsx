/**
 * features/foods/components/food-entry-list.tsx
 *
 * 【責務】
 * 食品ライブラリエントリを一覧で表示し、編集・削除・今日食べたボタンを提供する。
 *
 * 【使用箇所】
 * - FoodsScreen
 *
 * 【やらないこと】
 * - 状態管理
 */

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { FoodLibraryEntry } from '@/constants/schema';

export type FoodEntryListProps = {
  entries: FoodLibraryEntry[];
  isRefreshing: boolean;
  onRefresh: () => void;
  onEdit: (entry: FoodLibraryEntry) => void;
  onDelete: (entryId: string) => void;
  onEatToday: (entryId: string) => void;
};

/**
 * 食品エントリのリスト。
 */
export function FoodEntryList({ entries, isRefreshing, onRefresh, onEdit, onDelete, onEatToday }: FoodEntryListProps) {
  return (
    <FlatList
      data={entries}
      keyExtractor={(item) => item.id}
      style={styles.listContainer}
      contentContainerStyle={styles.list}
      refreshing={isRefreshing}
      onRefresh={onRefresh}
      renderItem={({ item }) => (
        <View style={styles.entryCard}>
          <View style={styles.entryHeader}>
            <Text style={styles.entryLabel}>{item.name}</Text>
            <Text style={styles.entryDate}>{formatEntryDate(item.createdAt)}</Text>
          </View>
          <Text style={styles.entryType}>
            {item.items.length > 1 ? 'メニュー' : '単品'} / {item.items.length}品
          </Text>
          <View style={styles.baseRow}>
            <Text style={styles.baseLabel}>基準量: {item.amount} / </Text>
            <Text style={styles.baseKcal}>{Math.round(item.calories)} kcal</Text>
          </View>
          <View style={styles.entryActions}>
            <Pressable onPress={() => onEdit(item)} accessibilityRole="button">
              <Text style={styles.link}>編集</Text>
            </Pressable>
            <Pressable onPress={() => onDelete(item.id)} accessibilityRole="button">
              <Text style={styles.danger}>削除</Text>
            </Pressable>
            <Pressable style={styles.todayButton} onPress={() => onEatToday(item.id)} accessibilityRole="button">
              <Text style={styles.todayLabel}>今日食べた</Text>
              <MaterialIcons name="chevron-right" size={14} color="#155dfc" />
            </Pressable>
          </View>
        </View>
      )}
      ListEmptyComponent={<Text style={styles.empty}>食品が登録されていません。</Text>}
    />
  );
}

/**
 * FoodLibraryEntry の日付を `YYYY/MM/DD` 形式へ整形する。
 * 呼び出し元: FoodEntryList。
 * @param createdAt ISO 文字列
 * @returns 整形済み日付
 * @remarks 副作用は存在しない。
 */
function formatEntryDate(createdAt: string): string {
  const date = new Date(createdAt);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}/${month}/${day}`;
}

const styles = StyleSheet.create({
  listContainer: {
    flex: 1,
  },
  list: {
    paddingBottom: 120,
  },
  entryCard: {
    borderWidth: 1,
    borderColor: '#f3f4f6',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  entryLabel: {
    fontSize: 18,
    fontWeight: '800',
    color: '#101828',
  },
  entryDate: {
    fontSize: 12,
    fontWeight: '700',
    color: '#99a1af',
  },
  entryType: {
    fontSize: 12,
    fontWeight: '700',
    color: '#99a1af',
    marginBottom: 8,
  },
  baseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  baseLabel: {
    fontSize: 14,
    color: '#6a7282',
  },
  baseKcal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#101828',
  },
  entryActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: '#f9fafb',
    paddingTop: 12,
  },
  link: {
    color: '#2b7fff',
    fontWeight: '800',
    fontSize: 13,
  },
  danger: {
    color: '#ff6467',
    fontWeight: '800',
    fontSize: 13,
  },
  todayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  todayLabel: {
    color: '#155dfc',
    fontWeight: '800',
    fontSize: 13,
  },
  empty: {
    textAlign: 'center',
    color: '#666',
    marginTop: 40,
  },
});
