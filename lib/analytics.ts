/**
 * lib/analytics.ts
 *
 * 【責務】
 * Firebase Analytics への計測イベント送信を一元化し、共通パラメータや初期化処理を提供する。
 *
 * 【使用箇所】
 * - app/_layout.tsx（初期化）
 * - 各スクリーン（logScreen/logEvent）
 *
 * 【やらないこと】
 * - ビジネスロジックでの判断
 * - UI 状態管理
 *
 * 【他ファイルとの関係】
 * - expo-firebase-analytics モジュールをラップし、Constants からアプリバージョンや UI バリアントを取得する。
 */

import Constants from 'expo-constants';
import * as Analytics from 'expo-firebase-analytics';
import { Platform } from 'react-native';

const extra = (Constants.expoConfig?.extra ?? {}) as { uiVariant?: string };
const appVersion = Constants.expoConfig?.version ?? '0.0.0';
const uiVariant = extra.uiVariant ?? 'v1';
const isSupportedPlatform = ['ios', 'android', 'web'].includes(Platform.OS);

let initialized = false;
let analyticsEnabled = isSupportedPlatform;
let pendingUserId: string | null = null;

/**
 * Firebase Analytics の利用準備を行う。
 * 呼び出し元: App レベル（RootNavigator）。
 * - Expo Go など非対応環境では以降のイベント送信をスキップする。
 */
export function initializeAnalytics(): void {
  if (initialized) {
    return;
  }
  initialized = true;
  analyticsEnabled = isSupportedPlatform;
  if (!analyticsEnabled) {
    console.info('Firebase Analytics は現在のプラットフォームで無効化されています');
    return;
  }
}

/**
 * Firebase Analytics のユーザー ID を更新する。
 * 呼び出し元: 認証状態が変化したタイミング。
 * @param userId サインイン済みならユーザー ID、未ログインなら null
 */
export async function updateAnalyticsUserId(userId: string | undefined): Promise<void> {
  pendingUserId = userId;
  if (!analyticsEnabled) {
    return;
  }
  try {
    await Analytics.setUserId(userId);
  } catch (error) {
    console.warn('Analytics ユーザー ID 設定に失敗しました', error);
  }
}

/**
 * 計測イベントに共通パラメータを付与する。
 * 呼び出し元: logScreen / logEvent。
 * @param params イベント固有のパラメータ
 * @returns Firebase へ送信する連想配列
 */
function appendCommonParams(params: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    app_version: appVersion,
    ui_variant: uiVariant,
    platform: Platform.OS,
    ...params,
  };
}

/**
 * Firebase Analytics への送信をラップし、エラー時は以降の送信を抑制する。
 * 呼び出し元: logScreen / logEvent。
 * @param eventName イベント名
 * @param params 送信パラメータ
 */
async function dispatchAnalytics(eventName: string, params?: Record<string, unknown>): Promise<void> {
  if (!analyticsEnabled) {
    return;
  }
  try {
    if (pendingUserId !== null) {
      await Analytics.setUserId(pendingUserId);
      pendingUserId = null;
    }
    await Analytics.logEvent(eventName, appendCommonParams(params));
  } catch (error) {
    analyticsEnabled = false;
    console.warn('Firebase Analytics への送信に失敗したため無効化しました', error);
  }
}

/**
 * 画面表示を計測する。
 * 呼び出し元: 各スクリーンの useFocusEffect。
 * @param screenName 画面識別子
 * @param params 任意の追加パラメータ
 */
export async function logScreen(screenName: string, params?: Record<string, unknown>): Promise<void> {
  await dispatchAnalytics('screen_view', { screen_name: screenName, ...params });
}

/**
 * 任意のイベントを計測する。
 * 呼び出し元: ボタン操作など。
 * @param eventName イベント名
 * @param params 付随パラメータ
 */
export async function logEvent(eventName: string, params?: Record<string, unknown>): Promise<void> {
  await dispatchAnalytics(eventName, params);
}
