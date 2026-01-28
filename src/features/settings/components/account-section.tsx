/**
 * features/settings/components/account-section.tsx
 *
 * 【責務】
 * アカウント情報とログアウトボタンを表示する。
 *
 * 【使用箇所】
 * - SettingsScreen
 *
 * 【やらないこと】
 * - 認証状態の更新処理
 *
 * 【他ファイルとの関係】
 * - useSettingsScreen のアカウント情報を表示する。
 */

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SectionCard } from './section-card';

export type AccountSectionProps = {
  email: string;
  onSignOut: () => void;
};

/**
 * アカウントセクションを描画する。
 * 呼び出し元: SettingsScreen。
 * @param props メールアドレスとログアウトハンドラ
 * @returns JSX.Element
 * @remarks 副作用は props のコールバック実行のみ。
 */
export function AccountSection({ email, onSignOut }: AccountSectionProps) {
  return (
    <SectionCard title="アカウント">
      <View style={styles.accountRow}>
        <View style={styles.iconBox}>
          <MaterialIcons name="person" size={20} color="#99a1af" />
        </View>
        <View style={styles.textBlock}>
          <Text style={styles.accountLabel}>ログイン中</Text>
          <Text style={styles.email}>{email}</Text>
        </View>
      </View>
      <Pressable style={styles.logoutButton} onPress={onSignOut} accessibilityRole="button">
        <Text style={styles.logoutLabel}>ログアウト</Text>
      </Pressable>
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    flex: 1,
  },
  accountLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#99a1af',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    fontWeight: '800',
    color: '#101828',
  },
  logoutButton: {
    backgroundColor: '#fef2f2',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  logoutLabel: {
    color: '#fb2c36',
    fontWeight: '800',
    fontSize: 16,
  },
});
