/**
 * features/record/components/record-quick-input-card.tsx
 *
 * 【責務】
 * 記録タブのクイック入力 UI を描画し、主要アクションを呼び出す。
 *
 * 【使用箇所】
 * - RecordScreen
 *
 * 【やらないこと】
 * - 解析や保存などのドメインロジック実装
 * - 入力値の状態管理
 *
 * 【他ファイルとの関係】
 * - RecordScreen から入力値とイベントハンドラを受け取る。
 */

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export type RecordQuickInputCardProps = {
  value: string;
  isAnalyzing: boolean;
  onChangeText: (value: string) => void;
  onSubmitText: () => void;
  onPressPhoto: () => void;
  onPressManual: () => void;
  onOpenLibrary: () => void;
};

/**
 * クイック入力カードを描画する。
 * 呼び出し元: RecordScreen。
 * @param props 入力値とアクションコールバック
 * @returns JSX.Element
 * @remarks 副作用は props のコールバック実行のみ。
 */
export function RecordQuickInputCard({
  value,
  isAnalyzing,
  onChangeText,
  onSubmitText,
  onPressPhoto,
  onPressManual,
  onOpenLibrary,
}: RecordQuickInputCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.textAreaWrapper}>
        <TextInput
          style={styles.textArea}
          placeholder="何を食べましたか？ (例: 納豆ご飯とプロテイン)"
          placeholderTextColor="#99a1af"
          multiline
          value={value}
          onChangeText={onChangeText}
        />
        <Pressable
          style={[styles.submitButton, isAnalyzing ? styles.submitButtonDisabled : null]}
          onPress={onSubmitText}
          disabled={isAnalyzing}
          accessibilityRole="button"
          accessibilityLabel="入力内容を解析">
          <MaterialIcons name="send" size={18} color="#9ca3af" />
        </Pressable>
      </View>
      <View style={styles.actionRow}>
        <Pressable
          style={[styles.actionButton, isAnalyzing ? styles.actionButtonDisabled : null]}
          onPress={onPressPhoto}
          disabled={isAnalyzing}
          accessibilityRole="button">
          <MaterialIcons name="photo-camera" size={18} color="#2563eb" />
          <Text style={styles.actionLabel}>写真で記録</Text>
        </Pressable>
        <Pressable
          style={[styles.actionButton, isAnalyzing ? styles.actionButtonDisabled : null]}
          onPress={onPressManual}
          disabled={isAnalyzing}
          accessibilityRole="button">
          <MaterialIcons name="edit" size={18} color="#2563eb" />
          <Text style={styles.actionLabel}>手動で入力</Text>
        </Pressable>
      </View>
      {isAnalyzing ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" />
          <Text style={styles.loadingText}>解析中...</Text>
        </View>
      ) : null}
      <Pressable style={styles.libraryLink} onPress={onOpenLibrary} accessibilityRole="button">
        <Text style={styles.libraryLabel}>ライブラリから追加</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 40,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  textAreaWrapper: {
    position: 'relative',
    backgroundColor: '#f9fafb',
    borderRadius: 24,
    padding: 16,
    minHeight: 96,
    justifyContent: 'center',
  },
  textArea: {
    minHeight: 56,
    fontSize: 14,
    color: '#101828',
    textAlignVertical: 'top',
    paddingRight: 56,
  },
  submitButton: {
    position: 'absolute',
    right: 14,
    bottom: 14,
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#f9fafb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#364153',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  loadingText: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '600',
  },
  libraryLink: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  libraryLabel: {
    color: '#155dfc',
    fontWeight: '700',
  },
});
