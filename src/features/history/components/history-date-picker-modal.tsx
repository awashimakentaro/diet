/**
 * features/history/components/history-date-picker-modal.tsx
 *
 * 【責務】
 * 日付選択のためのカレンダーモーダルを表示し、選択結果を返す。
 *
 * 【使用箇所】
 * - HistoryScreen
 *
 * 【やらないこと】
 * - 日付状態の保持
 * - 履歴データの取得
 *
 * 【他ファイルとの関係】
 * - lib/date.ts の日付変換を利用する。
 */

import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { formatDateKey, getTodayKey, parseDateKey } from '@/lib/date';

const weekLabels = ['日', '月', '火', '水', '木', '金', '土'];

export type HistoryDatePickerModalProps = {
  visible: boolean;
  dateKey: string;
  onSelectDateKey: (dateKey: string) => void;
  onRequestClose: () => void;
};

/**
 * 履歴用の日付ピッカーを描画する。
 * 呼び出し元: HistoryScreen。
 * @param props モーダル制御と日付選択コールバック
 * @returns JSX.Element | null
 * @remarks 副作用は props のコールバック実行のみ。
 */
export function HistoryDatePickerModal({ visible, dateKey, onSelectDateKey, onRequestClose }: HistoryDatePickerModalProps) {
  const selectedDate = useMemo(() => parseDateKey(dateKey), [dateKey]);
  const [displayMonth, setDisplayMonth] = useState(() => getMonthStart(selectedDate));
  const todayKey = getTodayKey();

  useEffect(() => {
    if (!visible) {
      return;
    }
    setDisplayMonth(getMonthStart(selectedDate));
  }, [selectedDate, visible]);

  const calendarWeeks = useMemo(() => buildCalendarWeeks(displayMonth), [displayMonth]);

  /**
   * 月表示を前月へ移動する。
   * 呼び出し元: HistoryDatePickerModal。
   * @returns void
   * @remarks 副作用: displayMonth の更新。
   */
  const handlePrevMonth = () => {
    setDisplayMonth((prev) => addMonths(prev, -1));
  };

  /**
   * 月表示を翌月へ移動する。
   * 呼び出し元: HistoryDatePickerModal。
   * @returns void
   * @remarks 副作用: displayMonth の更新。
   */
  const handleNextMonth = () => {
    setDisplayMonth((prev) => addMonths(prev, 1));
  };

  /**
   * 日付を選択して閉じる。
   * 呼び出し元: カレンダーの各日付ボタン。
   * @param date 選択された日付
   * @returns void
   * @remarks 副作用: onSelectDateKey / onRequestClose の実行。
   */
  const handleSelectDate = (date: Date) => {
    onSelectDateKey(formatDateKey(date));
    onRequestClose();
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onRequestClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onRequestClose} />
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.title}>日付を選択</Text>
            <Pressable onPress={onRequestClose} accessibilityRole="button">
              <Text style={styles.closeLabel}>閉じる</Text>
            </Pressable>
          </View>
          <View style={styles.monthRow}>
            <Pressable onPress={handlePrevMonth} accessibilityRole="button">
              <Text style={styles.monthAction}>前の月</Text>
            </Pressable>
            <Text style={styles.monthLabel}>{formatMonthLabel(displayMonth)}</Text>
            <Pressable onPress={handleNextMonth} accessibilityRole="button">
              <Text style={styles.monthAction}>次の月</Text>
            </Pressable>
          </View>
          <View style={styles.weekRow}>
            {weekLabels.map((label) => (
              <Text key={label} style={styles.weekLabel}>{label}</Text>
            ))}
          </View>
          <View style={styles.calendarGrid}>
            {calendarWeeks.map((week, weekIndex) => (
              <View key={`week-${weekIndex}`} style={styles.weekGridRow}>
                {week.map((date, index) => {
                  if (!date) {
                    return <View key={`empty-${weekIndex}-${index}`} style={styles.dayCell} />;
                  }
                  const key = formatDateKey(date);
                  const isSelected = key === dateKey;
                  const isToday = key === todayKey;
                  return (
                    <Pressable
                      key={key}
                      style={[
                        styles.dayCell,
                        isSelected ? styles.dayCellSelected : null,
                        !isSelected && isToday ? styles.dayCellToday : null,
                      ]}
                      onPress={() => handleSelectDate(date)}
                      accessibilityRole="button"
                      accessibilityLabel={`${key} を選択`}>
                      <Text style={[styles.dayLabel, isSelected ? styles.dayLabelSelected : null]}>
                        {date.getDate()}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

/**
 * 月初の日付に正規化する。
 * 呼び出し元: HistoryDatePickerModal。
 * @param date 対象日付
 * @returns 月初 Date
 * @remarks 副作用は存在しない。
 */
function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * 指定月の日数を返す。
 * 呼び出し元: buildCalendarWeeks。
 * @param date 対象月の任意日
 * @returns 日数
 * @remarks 副作用は存在しない。
 */
function getDaysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

/**
 * 月表示を移動する。
 * 呼び出し元: HistoryDatePickerModal。
 * @param date 基準月
 * @param offsetMonth 移動月数
 * @returns 移動後の月初 Date
 * @remarks 副作用は存在しない。
 */
function addMonths(date: Date, offsetMonth: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + offsetMonth, 1);
}

/**
 * 月表示ラベルを生成する。
 * 呼び出し元: HistoryDatePickerModal。
 * @param date 対象月
 * @returns 表示ラベル
 * @remarks 副作用は存在しない。
 */
function formatMonthLabel(date: Date): string {
  return `${date.getFullYear()}年${date.getMonth() + 1}月`;
}

/**
 * 月表示のカレンダー行列を生成する。
 * 呼び出し元: HistoryDatePickerModal。
 * @param monthDate 月初の日付
 * @returns 週単位の配列
 * @remarks 副作用は存在しない。
 */
function buildCalendarWeeks(monthDate: Date): Array<Array<Date | null>> {
  const totalDays = getDaysInMonth(monthDate);
  const startWeekday = monthDate.getDay();
  const weeks: Array<Array<Date | null>> = [];
  let dayCounter = 1;

  for (let week = 0; week < 6; week += 1) {
    const row: Array<Date | null> = [];
    for (let day = 0; day < 7; day += 1) {
      const cellIndex = week * 7 + day;
      if (cellIndex < startWeekday || dayCounter > totalDays) {
        row.push(null);
      } else {
        row.push(new Date(monthDate.getFullYear(), monthDate.getMonth(), dayCounter));
        dayCounter += 1;
      }
    }
    weeks.push(row);
  }

  return weeks;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#101828',
  },
  closeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#155dfc',
  },
  monthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  monthLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#101828',
  },
  monthAction: {
    fontSize: 13,
    fontWeight: '600',
    color: '#155dfc',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  weekLabel: {
    width: 40,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#99a1af',
  },
  calendarGrid: {
    gap: 6,
  },
  weekGridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCell: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellSelected: {
    backgroundColor: '#155dfc',
  },
  dayCellToday: {
    borderWidth: 1,
    borderColor: '#155dfc',
  },
  dayLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#101828',
  },
  dayLabelSelected: {
    color: '#ffffff',
  },
});
