/**
 * features/record/components/library-picker-modal.tsx
 *
 * 【責務】
 * 食品ライブラリから Draft へ取り込むためのモーダル UI を描画する。
 *
 * 【使用箇所】
 * - RecordScreen
 *
 * 【やらないこと】
 * - ライブラリ同期や Draft 作成ロジック
 *
 * 【他ファイルとの関係】
 * - FoodLibraryAgent が返すエントリを受け取り UI で表示する。
 */

import { FlatList, Modal, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { FoodLibraryEntry } from '@/constants/schema';

export type LibraryPickerModalProps = {
  visible: boolean;
  entries: FoodLibraryEntry[];
  onSelectEntry: (entryId: string) => void;
  onRequestClose: () => void;
};

/**
 * ライブラリ選択モーダル。
 * 呼び出し元: RecordScreen。
 */
export function LibraryPickerModal({ visible, entries, onSelectEntry, onRequestClose }: LibraryPickerModalProps) {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onRequestClose}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.title}>ライブラリから選択</Text>
          <Text style={styles.hint}>保存した食品・メニューから選択できます</Text>
          <FlatList
            data={entries}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <Pressable style={styles.item} onPress={() => onSelectEntry(item.id)}>
                <View>
                  <Text style={styles.label}>{item.name}</Text>
                  <Text style={styles.meta}>{item.items.length > 1 ? 'メニュー' : '単品'} / {item.items.length} 品</Text>
                </View>
                <Text style={styles.meta}>追加</Text>
              </Pressable>
            )}
            ListEmptyComponent={<Text style={styles.meta}>ライブラリが空です。</Text>}
          />
          <Pressable style={styles.closeButton} onPress={onRequestClose} accessibilityRole="button">
            <Text style={styles.closeLabel}>閉じる</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  hint: {
    color: '#666',
    marginBottom: 12,
  },
  list: {
    flexGrow: 1,
  },
  item: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
  meta: {
    color: '#666',
  },
  closeButton: {
    borderWidth: 1,
    borderColor: '#0a7ea4',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  closeLabel: {
    color: '#0a7ea4',
    fontWeight: '600',
  },
});
