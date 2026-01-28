/**
 * app/_layout.tsx
 *
 * 【責務】
 * Expo Router のルートレイアウトを定義し、認証状態に応じてタブナビゲーションまたはログイン画面を切り替える。
 *
 * 【使用箇所】
 * - expo-router によるエントリポイント
 *
 * 【やらないこと】
 * - 各画面の UI 実装
 *
 * 【他ファイルとの関係】
 * - providers/auth-provider.tsx と components/auth-screen.tsx を利用する。
 */

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/providers/auth-provider';
import { AuthScreen } from '@/components/auth-screen';
import { initializeAnalytics, updateAnalyticsUserId } from '@/lib/analytics';
import { initializeNotificationHandler } from '@/agents/notification-agent';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    initializeNotificationHandler();
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <RootNavigator />
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}

/**
 * 認証状態に応じたナビゲーションまたはログイン画面を描画する。
 * 呼び出し元: RootLayout。
 */
function RootNavigator(): JSX.Element {
  const { status, user } = useAuth();

  useEffect(() => {
    if (status === 'signed-in') {
      initializeAnalytics();
    }
  }, [status, user?.id]);

  useEffect(() => {
    if (status === 'signed-in') {
      void updateAnalyticsUserId(user?.id ?? undefined);
    }
  }, [status, user?.id]);

  if (status === 'checking') {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  if (status === 'signed-out') {
    return <AuthScreen />;
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
