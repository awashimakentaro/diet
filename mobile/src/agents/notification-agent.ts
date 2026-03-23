/**
 * agents/notification-agent.ts
 *
 * 【責務】
 * 端末内のローカル通知スケジュールを管理し、本文生成ロジックを提供する。
 *
 * 【使用箇所】
 * - SettingsScreen
 * - RootLayout（通知ハンドラ初期化）
 *
 * 【やらないこと】
 * - バックエンドからのプッシュ通知配信
 *
 * 【他ファイルとの関係】
 * - lib/diet-store.ts の notification 設定を更新する。
 * - summary-agent.ts の日次サマリーを通知本文に利用する。
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { DailySummary, getDailySummary } from '@/agents/summary-agent';
import { NotificationSetting, NotificationTime } from '@/constants/schema';
import { setNotification, getDietState } from '@/lib/diet-store';
import { getTodayKey } from '@/lib/date';
import { supabase, requireUserId } from '@/lib/supabase';
import { mapNotificationRow } from '@/lib/mappers';

export type NotificationContent = {
  title: string;
  body: string;
};

const notificationTimeTable: Record<NotificationTime, { hour: number; minute: number }> = {
  morning: { hour: 9, minute: 0 },
  noon: { hour: 13, minute: 0 },
  evening: { hour: 19, minute: 0 },
  midnight: { hour: 22, minute: 0 },
};

let notificationHandlerConfigured = false;

/**
 * フォアグラウンド時の通知表示方針を初期化する。
 * 呼び出し元: RootLayout。
 * @remarks 副作用としてハンドラを登録する。
 */
export function initializeNotificationHandler(): void {
  if (notificationHandlerConfigured) {
    return;
  }
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
  notificationHandlerConfigured = true;
}

/**
 * 通知権限を要求する。
 * 呼び出し元: SettingsScreen。
 * @returns 許可された場合は true
 */
export async function requestPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) {
    return true;
  }
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
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
      notify_at_midnight: setting.times.includes('midnight'),
      push_token: encodeMeta(setting),
    });
  if (error) {
    throw new Error(error.message);
  }
  await ensureNotificationChannel();
  await scheduleLocalNotifications(setting);
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
    .upsert({
      user_id: userId,
      notify_at_midnight: false,
      push_token: encodeMeta({ ...getDietState().notification, enabled: false }),
    });
  if (error) {
    throw new Error(error.message);
  }
  await Notifications.cancelAllScheduledNotificationsAsync();
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
    body: `摂取 ${Math.round(summary.totals.kcal)} kcal / P${Math.round(summary.totals.protein)} F${Math.round(
      summary.totals.fat,
    )} C${Math.round(summary.totals.carbs)} (${status})`,
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
  const setting = deriveSettingFromRow(data);
  setNotification(setting);
  return setting;
}

/**
 * ローカル通知を指定の時間で再スケジュールする。
 * 呼び出し元: updateSchedule。
 * @param setting 通知設定
 * @remarks 副作用として端末内のスケジュールを置き換える。
 */
async function scheduleLocalNotifications(setting: NotificationSetting): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!setting.enabled) {
    return;
  }
  const content = buildContentForSchedule();
  const uniqueTimes = Array.from(new Set(setting.times));
  await Promise.all(
    uniqueTimes.map(async (time) => {
      const schedule = notificationTimeTable[time];
      await Notifications.scheduleNotificationAsync({
        content,
        trigger: { hour: schedule.hour, minute: schedule.minute, repeats: true },
      });
    }),
  );
}

/**
 * スケジュール用の通知本文を生成する。
 * 呼び出し元: scheduleLocalNotifications。
 * @returns NotificationContentInput
 * @remarks 副作用は存在しない。
 */
function buildContentForSchedule(): Notifications.NotificationContentInput {
  const todayKey = getTodayKey();
  const summary = getDailySummary(todayKey);
  const payload = buildPayload(todayKey, summary);
  return {
    title: payload.title,
    body: payload.body,
    sound: 'default',
    channelId: Platform.OS === 'android' ? 'daily-summary' : undefined,
  };
}

/**
 * Android の通知チャンネルを用意する。
 * 呼び出し元: updateSchedule。
 * @remarks 副作用として OS の通知チャンネルを作成する。
 */
async function ensureNotificationChannel(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }
  await Notifications.setNotificationChannelAsync('daily-summary', {
    name: 'Daily Summary',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
    vibrationPattern: [0, 250, 250, 250],
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });
}

function deriveSettingFromRow(row: any): NotificationSetting {
  const base = mapNotificationRow(row);
  const meta = decodeMeta(row.push_token);
  return {
    ...base,
    pushToken: meta.token ?? base.pushToken,
    times: meta.times ?? ['midnight'],
  };
}

type NotificationMeta = {
  times?: NotificationTime[];
  token?: string | null;
};

function encodeMeta(setting: NotificationSetting): string {
  const meta: NotificationMeta = {
    times: setting.times,
    token: setting.pushToken ?? null,
  };
  return JSON.stringify(meta);
}

function decodeMeta(value?: string | null): NotificationMeta {
  if (!value) {
    return { times: ['midnight'] };
  }
  try {
    const parsed = JSON.parse(value) as NotificationMeta;
    return {
      times: Array.isArray(parsed.times) && parsed.times.length > 0 ? (parsed.times as NotificationTime[]) : ['midnight'],
      token: parsed.token ?? null,
    };
  } catch (error) {
    console.warn('Failed to parse notification meta', error);
    return { times: ['midnight'] };
  }
}
