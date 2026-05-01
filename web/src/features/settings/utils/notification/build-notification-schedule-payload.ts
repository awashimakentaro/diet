/* 【責務】
 * Settings の通知設定値を保存 payload へ変換する。
 */

import type { ReminderSlot } from '../../types';

export type NotificationSchedulePayload = {
  enabled: boolean;
  reminder: ReminderSlot;
  time: string;
};

const REMINDER_TIME_MAP: Record<ReminderSlot, string> = {
  morning: '09:00',
  noon: '13:00',
  evening: '19:00',
  night: '22:00',
};

type BuildNotificationSchedulePayloadResult =
  | { ok: true; payload: NotificationSchedulePayload }
  | { ok: false; error: string };

export function buildNotificationSchedulePayload({
  enabled,
  selectedReminder,
}: {
  enabled: boolean;
  selectedReminder: ReminderSlot | null;
}): BuildNotificationSchedulePayloadResult {
  if (selectedReminder === null) {
    return {
      ok: false,
      error: '通知時間を選択してください。',
    };
  }

  return {
    ok: true,
    payload: {
      enabled,
      reminder: selectedReminder,
      time: REMINDER_TIME_MAP[selectedReminder],
    },
  };
}
