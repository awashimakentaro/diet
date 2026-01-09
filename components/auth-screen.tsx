/**
 * components/auth-screen.tsx
 *
 * 【責務】
 * Supabase 認証フォームを表示し、ログイン/新規登録を切り替えながらユーザーの資格情報を入力させる。
 *
 * 【使用箇所】
 * - app/_layout.tsx の認証ゲート
 *
 * 【やらないこと】
 * - Supabase との直接通信（AuthProvider に委譲）
 * - ナビゲーション制御
 *
 * 【他ファイルとの関係】
 * - providers/auth-provider.tsx が提供する useAuth を利用する。
 */

import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/providers/auth-provider';

type AuthMode = 'sign-in' | 'sign-up';

/**
 * 認証フォームを描画するコンポーネント。
 * 呼び出し元: RootLayout の AuthGate。
 */
export function AuthScreen(): JSX.Element {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const headline = useMemo(() => (mode === 'sign-in' ? 'ログイン' : '新規登録'), [mode]);
  const toggleLabel = useMemo(
    () => (mode === 'sign-in' ? '初めての方はこちら' : 'アカウントをお持ちの方はこちら'),
    [mode],
  );
  const toggleCta = useMemo(() => (mode === 'sign-in' ? '新規登録に切り替え' : 'ログインに戻る'), [mode]);

  /**
   * 現在のモードに応じてサインインまたはサインアップを実行する。
   * 呼び出し元: 送信ボタン onPress。
   */
  const handleSubmit = useCallback(async () => {
    try {
      setLoading(true);
      if (mode === 'sign-in') {
        await signIn(email, password);
      } else {
        await signUp(email, password);
        Alert.alert('仮登録を受け付けました', '確認メールのリンクから認証を完了してください。');
      }
    } catch (error) {
      Alert.alert('認証に失敗しました', String((error as Error).message));
    } finally {
      setLoading(false);
    }
  }, [email, mode, password, signIn, signUp]);

  /**
   * ログイン <-> 新規登録モードを切り替える。
   * 呼び出し元: トグルリンク。
   */
  const handleToggleMode = useCallback(() => {
    setMode((prev) => (prev === 'sign-in' ? 'sign-up' : 'sign-in'));
  }, []);

  const disabled = loading || !email.trim() || password.trim().length < 6;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <View style={styles.container}>
          <Text style={styles.title}>Diet</Text>
          <Text style={styles.headline}>{headline}</Text>
          <TextInput
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            placeholder="メールアドレス"
            placeholderTextColor="#777"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            textContentType="emailAddress"
          />
          <TextInput
            autoCapitalize="none"
            autoComplete="password"
            placeholder="パスワード (6文字以上)"
            placeholderTextColor="#777"
            secureTextEntry
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            textContentType="password"
          />
          <Pressable style={[styles.button, disabled && styles.buttonDisabled]} disabled={disabled} onPress={handleSubmit}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{headline}</Text>}
          </Pressable>
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleLabel}>{toggleLabel}</Text>
            <Pressable onPress={handleToggleMode}>
              <Text style={styles.toggleCta}>{toggleCta}</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default AuthScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    gap: 16,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  headline: {
    fontSize: 24,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#fff',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#22c55e',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  toggleContainer: {
    alignItems: 'center',
    gap: 4,
    marginTop: 12,
  },
  toggleLabel: {
    color: '#CBD5F5',
  },
  toggleCta: {
    color: '#60a5fa',
    fontWeight: 'bold',
  },
});
