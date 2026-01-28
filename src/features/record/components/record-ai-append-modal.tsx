/**
 * features/record/components/record-ai-append-modal.tsx
 *
 * 【責務】
 * AI 追加用のプロンプト入力モーダルを描画し、入力値を親へ渡す。
 *
 * 【使用箇所】
 * - RecordScreen
 *
 * 【やらないこと】
 * - AI 解析の実行
 * - Draft の保存処理
 *
 * 【他ファイルとの関係】
 * - useRecordScreen から渡された入力状態を表示する。
 */

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export type RecordAiAppendModalProps = {
  visible: boolean;
  value: string;
  onChangeText: (value: string) => void;
  onRequestClose: () => void;
  onSubmit: () => void;
  isLoading: boolean;
};

/**
 * AI 追加のプロンプト入力モーダルを描画する。
 * 呼び出し元: RecordScreen。
 * @param props 入力値とコールバック
 * @returns JSX.Element
 * @remarks 副作用は props のコールバック実行のみ。
 */
export function RecordAiAppendModal({
  visible,
  value,
  onChangeText,
  onRequestClose,
  onSubmit,
  isLoading,
}: RecordAiAppendModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onRequestClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onRequestClose} />
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>AIで食品を追加</Text>
            <Pressable style={styles.closeButton} onPress={onRequestClose} accessibilityRole="button">
              <MaterialIcons name="close" size={16} color="#9ca3af" />
            </Pressable>
          </View>
          <Text style={styles.helper}>例: サラダチキンと野菜スープ</Text>
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            placeholder="追加したい内容を入力"
            placeholderTextColor="#cbd5e1"
            multiline
          />
          <View style={styles.footerRow}>
            <Pressable
              style={styles.cancelButton}
              onPress={onRequestClose}
              accessibilityRole="button"
              disabled={isLoading}>
              <Text style={styles.cancelLabel}>キャンセル</Text>
            </Pressable>
            <Pressable
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={onSubmit}
              accessibilityRole="button"
              disabled={isLoading}>
              {isLoading ? (
                <>
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text style={styles.submitLabel}>解析中...</Text>
                </>
              ) : (
                <>
                  <MaterialIcons name="auto-awesome" size={18} color="#ffffff" />
                  <Text style={styles.submitLabel}>追加する</Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    width: '86%',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#101828',
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helper: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 8,
  },
  input: {
    minHeight: 96,
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 14,
    fontSize: 14,
    color: '#101828',
    textAlignVertical: 'top',
  },
  footerRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#99a1af',
  },
  submitButton: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#0092b8',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ffffff',
  },
});
