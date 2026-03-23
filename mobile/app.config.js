require('dotenv/config');

// Expo Router の app ディレクトリ指定
process.env.EXPO_ROUTER_APP_ROOT = './src/app';

module.exports = ({ config }) => ({
  ...config,

  name: "Diet PFC", // ← App Store表示名（後から変更可）

  ios: {
    ...config.ios,
    bundleIdentifier: "com.awashima.diet", // ← 絶対に変更しない
    supportsTablet: false,                 // ← iPad対応OFF（最短用）
    buildNumber: "1",                       // ← App Store必須
  },

  extra: {
    ...config.extra,
    supabaseDemoUserId: process.env.EXPO_PUBLIC_SUPABASE_DEMO_USER_ID,
  },
});
