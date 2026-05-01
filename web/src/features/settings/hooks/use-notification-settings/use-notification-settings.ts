'use client';

/* 【責務】
 * Settings 画面の通知設定状態を管理する。
 */

import { useState } from 'react';

import type { ReminderSlot } from '../../types';
import { buildNotificationSchedulePayload } from '../../utils/notification';

export type UseNotificationSettingsResult = {
  notificationsEnabled: boolean;
  selectedReminder: ReminderSlot;
  handleToggleNotificationEnabled: () => void;
  handleSelectReminder: (value: ReminderSlot) => void;
  handleSaveNotification: () => boolean;
};

export function useNotificationSettings(): UseNotificationSettingsResult {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<ReminderSlot>('night');

  function handleToggleNotificationEnabled(): void {
    setNotificationsEnabled((current) => !current);
  }

  function handleSelectReminder(value: ReminderSlot): void {
    setSelectedReminder(value);
  }

  function handleSaveNotification(): boolean {
    const result = buildNotificationSchedulePayload({
      enabled: notificationsEnabled,
      selectedReminder,
    });

    return result.ok;
  }

  return {
    notificationsEnabled,
    selectedReminder,
    handleToggleNotificationEnabled,
    handleSelectReminder,
    handleSaveNotification,
  };
}
