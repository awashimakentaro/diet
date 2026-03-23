/**
 * app/(tabs)/index.tsx
 *
 * 【責務】
 * 記録タブの画面コンポーネントを Expo Router のルートに接続する。
 *
 * 【使用箇所】
 * - Expo Router の `(tabs)` 配下 `index` ルート
 *
 * 【やらないこと】
 * - UI 実装や状態管理
 *
 * 【他ファイルとの関係】
 * - features/record/record-screen.tsx をラップしてエクスポートする。
 */

export { RecordScreen as default } from '@/features/record/record-screen';
