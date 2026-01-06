require('dotenv/config');

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
