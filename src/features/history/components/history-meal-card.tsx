/**
 * features/history/components/history-meal-card.tsx
 *
 * 【責務】
 * 履歴タブ向けに Meal をカード形式で表示し、操作ボタンを描画する。
 *
 * 【使用箇所】
 * - HistoryMealList
 *
 * 【やらないこと】
 * - Meal の保存や削除ロジック
 * - 日付やサマリーの状態管理
 *
 * 【他ファイルとの関係】
 * - constants/schema.ts の Meal 型をレンダリングする。
 */

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Meal } from '@/constants/schema';
import { formatTime } from '@/lib/date';

export type HistoryMealCardProps = {
  meal: Meal;
  onEdit: () => void;
  onDelete: () => void;
  onSave: () => void;
};

/**
 * 履歴表示用の Meal カード。
 * 呼び出し元: HistoryMealList。
 * @param props Meal と操作ハンドラ
 * @returns JSX.Element
 * @remarks 副作用は props のコールバック実行のみ。
 */
export function HistoryMealCard({ meal, onEdit, onDelete, onSave }: HistoryMealCardProps) {
  const timeLabel = formatTime(new Date(meal.recordedAt));
  const sourceLabel = meal.source;

  return (
    <View style={styles.card} accessibilityRole="summary" accessibilityLabel={`${meal.menuName} ${Math.round(meal.totals.kcal)}キロカロリー`}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>{meal.menuName}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.meta}>{timeLabel}</Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.meta}>{sourceLabel}</Text>
          </View>
        </View>
        <View style={styles.kcalBlock}>
          <Text style={styles.kcalValue}>{Math.round(meal.totals.kcal)}</Text>
          <Text style={styles.kcalUnit}>kcal</Text>
        </View>
      </View>
      <View style={styles.itemsWrapper}>
        {meal.items.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <Text style={styles.itemName}>{item.name}</Text>
            <View style={styles.itemMeta}>
              <Text style={styles.itemAmount}>{item.amount}</Text>
              <Text style={styles.itemKcal}>{Math.round(item.kcal)} kcal</Text>
            </View>
          </View>
        ))}
      </View>
      <View style={styles.actionRow}>
        <ActionButton icon="edit" label="編集" onPress={onEdit} />
        <ActionButton icon="delete-outline" label="削除" onPress={onDelete} />
        <ActionButton icon="bookmark-border" label="保存" onPress={onSave} accent />
      </View>
    </View>
  );
}

type ActionButtonProps = {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  onPress: () => void;
  accent?: boolean;
};

/**
 * 操作ボタンを描画する。
 * 呼び出し元: HistoryMealCard。
 * @param props アイコンとラベル
 * @returns JSX.Element
 * @remarks 副作用は props のコールバック実行のみ。
 */
function ActionButton({ icon, label, onPress, accent }: ActionButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.actionButton, accent ? styles.actionButtonAccent : null]}
      accessibilityRole="button">
      <MaterialIcons name={icon} size={14} color={accent ? '#155dfc' : '#4a5565'} />
      <Text style={[styles.actionLabel, accent ? styles.actionLabelAccent : null]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#101828',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  meta: {
    fontSize: 12,
    color: '#99a1af',
    fontWeight: '500',
  },
  metaDot: {
    fontSize: 12,
    color: '#99a1af',
  },
  kcalBlock: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  kcalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#101828',
  },
  kcalUnit: {
    fontSize: 12,
    fontWeight: '700',
    color: '#99a1af',
    marginBottom: 2,
  },
  itemsWrapper: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f9fafb',
    paddingVertical: 10,
    gap: 6,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    color: '#6a7282',
    fontWeight: '500',
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemAmount: {
    fontSize: 14,
    color: '#99a1af',
  },
  itemKcal: {
    fontSize: 14,
    color: '#364153',
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    height: 38,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionButtonAccent: {
    borderColor: '#dbeafe',
    backgroundColor: 'rgba(239,246,255,0.5)',
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4a5565',
  },
  actionLabelAccent: {
    color: '#155dfc',
  },
});
