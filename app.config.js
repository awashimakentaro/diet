/**
 * app.config.js
 *
 * 【責務】
 * Expo 設定に .env の Supabase 関連値を注入し、アプリ本体から参照できるようにする。
 *
 * 【使用箇所】
 * - Expo CLI（npx expo start）
 *
 * 【やらないこと】
 * - ランタイムロジックの実装
 *
 * 【他ファイルとの関係】
 * - lib/supabase.ts などが extra.supabaseDemoUserId を参照する。
 */

require('dotenv/config');

module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    supabaseDemoUserId: process.env.EXPO_PUBLIC_SUPABASE_DEMO_USER_ID,
  },
});
