/**
 * features/settings/components/settings-header.tsx
 *
 * 【責務】
 * 設定タブのブランドヘッダーを描画する。
 *
 * 【使用箇所】
 * - SettingsScreen
 *
 * 【やらないこと】
 * - 画面遷移の制御
 * - データ取得
 *
 * 【他ファイルとの関係】
 * - SettingsScreen から呼び出される。
 */

import type { JSX } from 'react';
import { StyleSheet, Text, View } from 'react-native';

/**
 * 設定タブのヘッダーを描画する。
 * 呼び出し元: SettingsScreen。
 * @returns JSX.Element
 * @remarks 副作用は存在しない。
 */
export function SettingsHeader(): JSX.Element {
  return (
    <View style={styles.container}>
      <View style={styles.titleBlock}>
        <Text style={styles.title}>PFC TRACKER</Text>
        <Text style={styles.subtitle}>FITNESS ANALYTICS</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleBlock: {
    gap: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#101828',
    letterSpacing: -0.6,
  },
  subtitle: {
    fontSize: 8,
    fontWeight: '800',
    color: '#99a1af',
    letterSpacing: 1.2,
  },
});
