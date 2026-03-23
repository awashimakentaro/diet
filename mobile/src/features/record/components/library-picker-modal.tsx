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

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>ライブラリから選択</Text>
              <Text style={styles.hint}>保存した食品・メニューから選択できます</Text>
            </View>
            <Pressable style={styles.closeIcon} onPress={onRequestClose} accessibilityRole="button">
              <MaterialIcons name="close" size={16} color="#667085" />
            </Pressable>
          </View>
          <FlatList
            data={entries}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <Pressable
                style={styles.item}
                onPress={() => onSelectEntry(item.id)}
                accessibilityRole="button"
                accessibilityLabel={`${item.name}を追加`}>
                <View style={styles.itemContent}>
                  <Text style={styles.label}>{item.name}</Text>
                  <Text style={styles.meta}>
                    {item.items.length > 1 ? 'メニュー' : '単品'} / {item.items.length} 品
                  </Text>
                </View>
                <View style={styles.actionPill}>
                  <Text style={styles.actionLabel}>追加</Text>
                </View>
              </Pressable>
            )}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>ライブラリが空です。</Text>
              </View>
            }
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
    backgroundColor: '#f9fafb',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9fafb',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#101828',
    marginBottom: 4,
  },
  hint: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  closeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    flexGrow: 1,
    paddingTop: 4,
    paddingBottom: 16,
  },
  item: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    borderRadius: 20,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  itemContent: {
    flex: 1,
    paddingRight: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '800',
    color: '#101828',
    marginBottom: 4,
  },
  meta: {
    color: '#99a1af',
    fontSize: 12,
    fontWeight: '600',
  },
  actionPill: {
    backgroundColor: '#eff6ff',
    borderColor: '#dbeafe',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  actionLabel: {
    color: '#155dfc',
    fontWeight: '800',
    fontSize: 12,
  },
  emptyState: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#99a1af',
    fontSize: 12,
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: '#155dfc',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  closeLabel: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14,
  },
});
