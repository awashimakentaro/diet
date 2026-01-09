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
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/providers/auth-provider';
import { AuthScreen } from '@/components/auth-screen';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

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
  const { status } = useAuth();

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
