/**
 * app/(tabs)/history.tsx
 *
 * 【責務】
 * 履歴タブ用の HistoryScreen を Expo Router のルートへ接続する。
 *
 * 【使用箇所】
 * - Expo Router の `(tabs)/history` ルート
 *
 * 【やらないこと】
 * - 状態管理や UI 実装
 *
 * 【他ファイルとの関係】
 * - features/history/history-screen.tsx をエクスポートする。
 */

export { HistoryScreen as default } from '@/features/history/history-screen';
