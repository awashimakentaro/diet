/**
 * features/record/components/record-input-card.tsx
 *
 * 【責務】
 * 記録タブにおけるテキスト入力、解析ボタン、ライブラリ呼び出しリンクをまとめた UI を提供する。
 *
 * 【使用箇所】
 * - RecordScreen
 *
 * 【やらないこと】
 * - 解析ロジックの実装
 *
 * 【他ファイルとの関係】
 * - RecordScreen から受け取ったコールバックをボタンに紐づける。
 */

import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export type RecordInputCardProps = {
  value: string;
  onChangeText: (value: string) => void;
  onAnalyzeText: () => void;
  onAnalyzeImage: () => void;
  onOpenLibrary: () => void;
  isAnalyzing: boolean;
};

/**
 * 記録タブの入力エリア。
 * 呼び出し元: RecordScreen。
 */
export function RecordInputCard({ value, onChangeText, onAnalyzeText, onAnalyzeImage, onOpenLibrary, isAnalyzing }: RecordInputCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>テキスト入力</Text>
      <TextInput
        style={styles.textArea}
        multiline
        placeholder="例: 朝ごはんにオートミールと卵を食べた"
        value={value}
        onChangeText={onChangeText}
      />
      <View style={styles.row}>
        <Pressable style={styles.primaryButton} onPress={onAnalyzeText} disabled={isAnalyzing} accessibilityRole="button">
          <Text style={styles.primaryButtonLabel}>解析する</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={onAnalyzeImage} disabled={isAnalyzing} accessibilityRole="button">
          <Text style={styles.secondaryLabel}>画像解析</Text>
        </Pressable>
      </View>
      {isAnalyzing ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator />
          <Text style={styles.loadingText}>解析中...</Text>
        </View>
      ) : null}
      <Pressable style={styles.linkButton} onPress={onOpenLibrary} accessibilityRole="button">
        <Text style={styles.linkLabel}>ライブラリから追加</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 16,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textArea: {
    minHeight: 80,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#0a7ea4',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonLabel: {
    color: '#fff',
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#0a7ea4',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryLabel: {
    color: '#0a7ea4',
    fontWeight: '600',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    color: '#666',
  },
  linkButton: {
    marginTop: 8,
  },
  linkLabel: {
    color: '#0a7ea4',
    fontWeight: '600',
  },
});
