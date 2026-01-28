/**
 * features/foods/components/foods-header.tsx
 *
 * 【責務】
 * 食品タブのブランドヘッダーを描画し、設定への導線を提供する。
 *
 * 【使用箇所】
 * - FoodsScreen
 *
 * 【やらないこと】
 * - ナビゲーションの状態管理
 * - 画面全体のレイアウト制御
 *
 * 【他ファイルとの関係】
 * - FoodsScreen から設定遷移用コールバックを受け取る。
 */

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export type FoodsHeaderProps = {
  onPressSettings: () => void;
};

/**
 * 食品タブのヘッダーを描画する。
 * 呼び出し元: FoodsScreen。
 * @param props 設定遷移のコールバック
 * @returns JSX.Element
 * @remarks 副作用は props のコールバック実行のみ。
 */
export function FoodsHeader({ onPressSettings }: FoodsHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.titleBlock}>
        <Text style={styles.title}>PFC TRACKER</Text>
        <Text style={styles.subtitle}>FITNESS ANALYTICS</Text>
      </View>
      <Pressable
        style={styles.actionButton}
        onPress={onPressSettings}
        accessibilityRole="button"
        accessibilityLabel="設定を開く">
        <MaterialIcons name="tune" size={18} color="#155dfc" />
      </Pressable>
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
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 14,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
