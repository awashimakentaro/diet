/**
 * index.js
 *
 * 【責務】
 * Expo Router エントリーポイントを登録し、React Native のバンドラ／ランタイムからアプリ本体を起動できるようにする。
 *
 * 【使用箇所】
 * - Metro バンドラ実行時の `--entry-file index.js`
 * - iOS/Android ネイティブランタイムでの JavaScript ロード
 *
 * 【やらないこと】
 * - アプリ画面やロジックの実装
 * - Expo Router の設定やルーティング定義
 *
 * 【他ファイルとの関係】
 * - `expo-router/entry` を読み込み、`app/` ディレクトリ以下のルート/コンポーネントを起動する。
 */

import 'expo-router/entry';
