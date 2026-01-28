/**
 * features/settings/components/section-card.tsx
 *
 * 【責務】
 * 設定タブのセクション見出しとカードレイアウトを提供する。
 *
 * 【使用箇所】
 * - ManualGoalSection
 * - AutoGoalSection
 * - NotificationSection
 * - AccountSection
 *
 * 【やらないこと】
 * - セクション内の入力や操作ロジック
 *
 * 【他ファイルとの関係】
 * - 設定タブ各セクションの共通枠として利用する。
 */

import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export type SectionCardProps = {
  title: string;
  children: ReactNode;
};

/**
 * セクションヘッダー付きのカード UI を描画する。
 * 呼び出し元: 設定タブの各セクション。
 * @param props タイトルと子要素
 * @returns JSX.Element
 * @remarks 副作用は存在しない。
 */
export function SectionCard({ title, children }: SectionCardProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 32,
  },
  title: {
    fontSize: 12,
    fontWeight: '800',
    color: '#99a1af',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    paddingLeft: 8,
    marginBottom: 12,
  },
  card: {
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'rgba(243,244,246,0.5)',
    paddingHorizontal: 28,
    paddingVertical: 28,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
});
