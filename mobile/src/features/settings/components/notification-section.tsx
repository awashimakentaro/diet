/**
 * features/settings/components/notification-section.tsx
 *
 * 【責務】
 * 通知トグルと時間選択、保存ボタンの UI を提供する。
 *
 * 【使用箇所】
 * - SettingsScreen
 *
 * 【やらないこと】
 * - 通知の実設定更新
 *
 * 【他ファイルとの関係】
 * - useSettingsScreen の状態とハンドラを受け取って描画する。
 */

import { Pressable, StyleSheet, Text, View } from 'react-native';

import { NotificationTime } from '@/constants/schema';

import { SectionCard } from './section-card';

const notificationTimeOptions: { value: NotificationTime; label: string; time: string }[] = [
  { value: 'morning', label: '朝', time: '09:00' },
  { value: 'noon', label: '昼', time: '13:00' },
  { value: 'evening', label: '夕', time: '19:00' },
  { value: 'midnight', label: '夜', time: '22:00' },
];

export type NotificationSectionProps = {
  enabled: boolean;
  selectedTimes: NotificationTime[];
  onToggleEnabled: (value: boolean) => void;
  onToggleTime: (time: NotificationTime) => void;
  onSave: () => void;
  previewBody: string;
};

/**
 * 通知設定セクションを描画する。
 * 呼び出し元: SettingsScreen。
 * @param props 通知状態と保存ハンドラ
 * @returns JSX.Element
 * @remarks 副作用は props のコールバック実行のみ。
 */
export function NotificationSection({
  enabled,
  selectedTimes,
  onToggleEnabled,
  onToggleTime,
  onSave,
}: NotificationSectionProps) {
  return (
    <SectionCard title="通知設定">
      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>スマート過不足通知</Text>
        <Pressable
          style={[styles.toggleTrack, enabled && styles.toggleTrackActive]}
          onPress={() => onToggleEnabled(!enabled)}
          accessibilityRole="switch"
          accessibilityState={{ checked: enabled }}>
          <View style={styles.toggleKnob} />
        </Pressable>
      </View>
      <View style={styles.timeRow}>
        {notificationTimeOptions.map((option) => {
          const active = selectedTimes.includes(option.value);
          return (
            <Pressable
              key={option.value}
              style={[
                styles.timeChip,
                active && styles.timeChipActive,
                !enabled && styles.timeChipDisabled,
              ]}
              disabled={!enabled}
              onPress={() => onToggleTime(option.value)}
              accessibilityRole="button">
              <Text style={[styles.timeLabel, active && styles.timeLabelActive]}>{option.label}</Text>
              <Text style={[styles.timeMeta, active && styles.timeLabelActive]}>{option.time}</Text>
            </Pressable>
          );
        })}
      </View>
      <Pressable style={styles.saveButton} onPress={onSave} accessibilityRole="button">
        <Text style={styles.saveLabel}>通知設定を保存</Text>
      </Pressable>
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb',
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 60,
    marginBottom: 16,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#101828',
  },
  toggleTrack: {
    width: 48,
    height: 28,
    borderRadius: 999,
    backgroundColor: '#e5e7eb',
    padding: 4,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  toggleTrackActive: {
    backgroundColor: '#155dfc',
    alignItems: 'flex-end',
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 999,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  timeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  timeChip: {
    flexBasis: '48%',
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    paddingVertical: 10,
    alignItems: 'center',
  },
  timeChipActive: {
    backgroundColor: '#eff6ff',
  },
  timeChipDisabled: {
    opacity: 0.4,
  },
  timeLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#101828',
  },
  timeMeta: {
    fontSize: 9,
    fontWeight: '700',
    color: '#99a1af',
  },
  timeLabelActive: {
    color: '#155dfc',
  },
  saveButton: {
    backgroundColor: '#155dfc',
    borderRadius: 16,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  saveLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
});
