/**
 * features/record/components/record-draft-card.tsx
 *
 * 【責務】
 * Draft の編集・警告表示・保存ボタンをまとめたカード UI を描画する。
 *
 * 【使用箇所】
 * - RecordDraftList
 *
 * 【やらないこと】
 * - Draft の状態管理
 *
 * 【他ファイルとの関係】
 * - FoodItemEditor を利用して食品カードを編集する。
 */

import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AnalyzeDraft, FoodItem } from '@/constants/schema';
import { FoodItemEditor } from '@/components/food-item-editor';

export type RecordDraftCardProps = {
  draft: AnalyzeDraft;
  onChangeItems: (items: FoodItem[]) => void;
  onChangeMenuName: (name: string) => void;
  onSave: () => void;
  onRemove: () => void;
  onRequestAiAppend: () => void;
};

/**
 * 単一 Draft を編集するカード。
 * 呼び出し元: RecordDraftList。
 */
export function RecordDraftCard({ draft, onChangeItems, onChangeMenuName, onSave, onRemove, onRequestAiAppend }: RecordDraftCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{draft.menuName || '新しいメニュー'}</Text>
        <Pressable onPress={onRemove} accessibilityRole="button">
          <Text style={styles.delete}>削除</Text>
        </Pressable>
      </View>
      <TextInput
        style={styles.nameInput}
        value={draft.menuName}
        placeholder="メニュー名を入力"
        onChangeText={onChangeMenuName}
      />
      {draft.warnings.length > 0 ? (
        <View style={styles.warningBox}>
          {draft.warnings.map((warning) => (
            <Text key={warning} style={styles.warningText}>
              {warning}
            </Text>
          ))}
        </View>
      ) : null}
      <FoodItemEditor items={draft.items} onChange={onChangeItems} onRequestAiAppend={onRequestAiAppend} />
      <Pressable style={styles.primaryButton} onPress={onSave} accessibilityRole="button">
        <Text style={styles.primaryLabel}>保存</Text>
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
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontWeight: '600',
    fontSize: 16,
  },
  delete: {
    color: '#f06292',
  },
  nameInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
  },
  warningBox: {
    backgroundColor: '#fff5e1',
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
  },
  warningText: {
    color: '#b26a00',
  },
  primaryButton: {
    marginTop: 12,
    backgroundColor: '#0a7ea4',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryLabel: {
    color: '#fff',
    fontWeight: '600',
  },
});
