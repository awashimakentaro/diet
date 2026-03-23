/**
 * features/settings/components/primary-button.tsx
 *
 * 【責務】
 * 設定タブで利用する汎用的なプライマリアクションボタンを描画する。
 */

import { Pressable, StyleSheet, Text } from 'react-native';

export type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
};

/**
 * 青色のプライマリーボタン。
 */
export function PrimaryButton({ label, onPress }: PrimaryButtonProps) {
  return (
    <Pressable style={styles.button} onPress={onPress} accessibilityRole="button">
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 8,
    backgroundColor: '#155dfc',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  label: {
    color: '#fff',
    fontWeight: '600',
  },
});
