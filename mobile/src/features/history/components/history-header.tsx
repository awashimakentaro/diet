/**
 * features/history/components/history-header.tsx
 *
 * 【責務】
 * 履歴タブのブランドヘッダーを描画する。
 *
 * 【使用箇所】
 * - HistoryScreen
 *
 * 【やらないこと】
 * - ナビゲーションの状態管理
 * - 画面全体のレイアウト制御
 *
 * 【他ファイルとの関係】
 * - HistoryScreen から呼び出される。
 */

import { StyleSheet, Text, View } from 'react-native';

/**
 * 履歴タブのヘッダーを描画する。
 * 呼び出し元: HistoryScreen。
 * @returns JSX.Element
 * @remarks 副作用は存在しない。
 */
export function HistoryHeader() {
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
