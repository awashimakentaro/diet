/**
 * agents/notification-agent.ts
 *
 * 【責務】
 * 0 時通知のスケジュール状態を管理し、本文生成ロジックを提供する。
 *
 * 【使用箇所】
 * - SettingsScreen
 *
 * 【やらないこと】
 * - 実際の OS 通知スケジューリング（Expo Notifications は未導入のため）
 *
 * 【他ファイルとの関係】
 * - lib/diet-store.ts の notification 設定を更新する。
 */

import { NotificationSetting } from '@/constants/schema';
import { DailySummary } from '@/agents/summary-agent';
import { setNotification, getDietState } from '@/lib/diet-store';
import { supabase, requireUserId } from '@/lib/supabase';
import { mapNotificationRow } from '@/lib/mappers';

export type NotificationContent = {
  title: string;
  body: string;
};

/**
 * 通知権限を要求するダミー実装。
 * 呼び出し元: SettingsScreen。
 * @returns 常に true（デモ用途）
 */
export async function requestPermission(): Promise<boolean> {
  return true;
}

/**
 * 通知スケジュール設定を更新する。
 * 呼び出し元: SettingsScreen。
 * @param setting 新しい設定
 */
export async function updateSchedule(setting: NotificationSetting): Promise<void> {
  const userId = await requireUserId();
  const { error } = await supabase
    .from('notification_preferences')
    .upsert({
      user_id: userId,
      notify_at_midnight: setting.enabled,
      push_token: setting.pushToken ?? null,
    });
  if (error) {
    throw new Error(error.message);
  }
  setNotification({ ...setting, lastScheduledAt: new Date().toISOString() });
}

/**
 * 通知 ON を解除する。
 * 呼び出し元: SettingsScreen。
 */
export async function cancelAll(): Promise<void> {
  const userId = await requireUserId();
  const { error } = await supabase
    .from('notification_preferences')
    .upsert({ user_id: userId, notify_at_midnight: false });
  if (error) {
    throw new Error(error.message);
  }
  setNotification({ ...getDietState().notification, enabled: false });
}

/**
 * Summary から通知本文を作成する。
 * 呼び出し元: SettingsScreen（プレビュー）。
 * @param dateKey サマリー対象日
 * @param summary DailySummary
 * @returns NotificationContent
 */
export function buildPayload(dateKey: string, summary: DailySummary): NotificationContent {
  const diffKcal = summary.diff.kcal;
  const status = Math.abs(diffKcal) < 50 ? '目標通り' : diffKcal > 0 ? `+${Math.round(diffKcal)} kcal` : `${Math.round(diffKcal)} kcal`;
  return {
    title: `${dateKey} の摂取結果`,
    body: `摂取 ${summary.totals.kcal} kcal / P${summary.totals.protein} F${summary.totals.fat} C${summary.totals.carbs} (${status})`,
  };
}

/**
 * 現在の通知設定を取得する。
 * 呼び出し元: SettingsScreen。
 * @returns NotificationSetting
 */
export function getNotificationSetting(): NotificationSetting {
  return { ...getDietState().notification };
}

/**
 * Supabase から通知設定を同期する。
 */
export async function fetchNotificationSetting(): Promise<NotificationSetting> {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) {
    throw new Error(error.message);
  }
  if (!data) {
    return getNotificationSetting();
  }
  const setting = mapNotificationRow(data);
  setNotification(setting);
  return setting;
}
