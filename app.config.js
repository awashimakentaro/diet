require('dotenv/config');

// Expo Router の app ディレクトリを `src/app` に変更
process.env.EXPO_ROUTER_APP_ROOT = './src/app';

module.exports = ({ config }) => ({
  ...config,
  ios: {
    ...config.ios,
    bundleIdentifier: "com.awashima.diet",
  },
  extra: {
    ...config.extra,
    supabaseDemoUserId: process.env.EXPO_PUBLIC_SUPABASE_DEMO_USER_ID,
  },
});
