/**
 * features/record/components/record-draft-list.tsx
 *
 * 【責務】
 * Draft 一覧を受け取り、RecordDraftCard を並べて表示する。
 *
 * 【使用箇所】
 * - RecordScreen
 *
 * 【やらないこと】
 * - Draft の状態変更ロジック
 *
 * 【他ファイルとの関係】
 * - RecordDraftCard を利用して実際の UI を構築する。
 */

import { StyleSheet, Text, View } from 'react-native';

import { AnalyzeDraft, FoodItem } from '@/constants/schema';

import { RecordDraftCard } from './record-draft-card';

export type RecordDraftListProps = {
  drafts: AnalyzeDraft[];
  onChangeItems: (draftId: string, items: FoodItem[]) => void;
  onChangeMenuName: (draftId: string, menuName: string) => void;
  onSaveDraft: (draft: AnalyzeDraft) => void;
  onRemoveDraft: (draftId: string) => void;
  onRequestAiAppend: (draftId: string) => void;
};

/**
 * Draft カードの一覧。
 * 呼び出し元: RecordScreen。
 */
export function RecordDraftList({ drafts, onChangeItems, onChangeMenuName, onSaveDraft, onRemoveDraft, onRequestAiAppend }: RecordDraftListProps) {
  if (drafts.length === 0) {
    return (
      <View style={styles.emptyBox}>
        <Text style={styles.emptyText}>解析されたメニューはまだありません。</Text>
      </View>
    );
  }

  return (
    <View>
      {drafts.map((draft) => (
        <RecordDraftCard
          key={draft.draftId}
          draft={draft}
          onChangeItems={(items) => onChangeItems(draft.draftId, items)}
          onChangeMenuName={(name) => onChangeMenuName(draft.draftId, name)}
          onSave={() => onSaveDraft(draft)}
          onRemove={() => onRemoveDraft(draft.draftId)}
          onRequestAiAppend={() => onRequestAiAppend(draft.draftId)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  emptyBox: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
  },
});
