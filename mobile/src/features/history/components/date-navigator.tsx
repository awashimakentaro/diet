/**
 * features/history/components/date-navigator.tsx
 *
 * 【責務】
 * 選択中の日付とカレンダー起動ボタンを表示する。
 *
 * 【使用箇所】
 * - HistoryScreen
 *
 * 【やらないこと】
 * - 日付状態の保持
 *
 * 【他ファイルとの関係】
 * - HistoryScreen から受け取ったハンドラを呼び出す。
 */

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export type DateNavigatorProps = {
  dateKey: string;
  onOpenPicker: () => void;
};

/**
 * 履歴タブの日付切替 UI。
 * 呼び出し元: HistoryScreen。
 */
export function DateNavigator({ dateKey, onOpenPicker }: DateNavigatorProps) {
  return (
    <View style={styles.row}>
      <Pressable onPress={onOpenPicker} style={styles.pill} accessibilityRole="button" accessibilityLabel="日付を選択">
        <MaterialIcons name="calendar-today" size={16} color="#155dfc" />
        <Text style={styles.dateLabel}>{dateKey}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#101828',
    letterSpacing: -0.2,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
});
