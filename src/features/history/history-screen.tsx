/**
 * features/history/history-screen.tsx
 *
 * 【責務】
 * 履歴タブの UI を組み立て、useHistoryScreen から提供される状態と操作を接続する。
 *
 * 【使用箇所】
 * - app/(tabs)/history.tsx
 *
 * 【やらないこと】
 * - CRUD ロジックの実装
 *
 * 【他ファイルとの関係】
 * - components/date-navigator や meal-list を組み合わせて表示する。
 */

import type { JSX } from 'react';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DateNavigator } from './components/date-navigator';
import { HistoryDatePickerModal } from './components/history-date-picker-modal';
import { HistoryHeader } from './components/history-header';
import { HistoryMealList } from './components/history-meal-list';
import { EditMealModal } from './components/edit-meal-modal';
import { useHistoryScreen } from './use-history-screen';

/**
 * 履歴タブ画面。
 * 呼び出し元: app/(tabs)/history.tsx。
 */
export function HistoryScreen(): JSX.Element {
  const router = useRouter();
  const {
    dateKey,
    meals,
    handleSelectDateKey,
    handleOpenEdit,
    handleDeleteMeal,
    handleDeleteAll,
    handleSaveToLibrary,
    editingMeal,
    editingItems,
    setEditingItems,
    editingMenuName,
    setEditingMenuName,
    editingOriginal,
    setEditingOriginal,
    handleSaveEdit,
    closeEditor,
    handleAiAppendEditingItems,
    aiAppendModal,
  } = useHistoryScreen();
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  /**
   * 設定タブへ遷移する。
   * 呼び出し元: HistoryHeader。
   * @returns void
   * @remarks 副作用: ナビゲーション実行。
   */
  const handlePressSettings = () => {
    router.push('/settings');
  };

  /**
   * 日付ピッカーを開く。
   * 呼び出し元: DateNavigator。
   * @returns void
   * @remarks 副作用: datePickerVisible の更新。
   */
  const handleOpenDatePicker = () => {
    setDatePickerVisible(true);
  };

  /**
   * 日付ピッカーを閉じる。
   * 呼び出し元: HistoryDatePickerModal。
   * @returns void
   * @remarks 副作用: datePickerVisible の更新。
   */
  const handleCloseDatePicker = () => {
    setDatePickerVisible(false);
  };

  /**
   * 日付選択結果を反映する。
   * 呼び出し元: HistoryDatePickerModal。
   * @param nextDateKey `YYYY-MM-DD` の日付キー
   * @returns void
   * @remarks 副作用: dateKey と datePickerVisible の更新。
   */
  const handlePickDateKey = (nextDateKey: string) => {
    handleSelectDateKey(nextDateKey);
    setDatePickerVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <HistoryHeader onPressSettings={handlePressSettings} />
      <ScrollView contentContainerStyle={styles.container}>
        <DateNavigator dateKey={dateKey} onOpenPicker={handleOpenDatePicker} />
        <HistoryMealList
          meals={meals}
          onEdit={handleOpenEdit}
          onDelete={handleDeleteMeal}
          onSaveToLibrary={handleSaveToLibrary}
        />
        <Pressable style={styles.bulkDeleteButton} onPress={handleDeleteAll} accessibilityRole="button">
          <Text style={styles.bulkDeleteLabel}>この日の記録をすべて削除</Text>
        </Pressable>
      </ScrollView>
      <EditMealModal
        visible={Boolean(editingMeal)}
        menuName={editingMenuName}
        originalText={editingOriginal}
        items={editingItems}
        onChangeMenuName={setEditingMenuName}
        onChangeOriginalText={setEditingOriginal}
        onChangeItems={setEditingItems}
        onRequestClose={closeEditor}
        onSubmit={handleSaveEdit}
        onRequestAiAppend={handleAiAppendEditingItems}
      />
      <HistoryDatePickerModal
        visible={datePickerVisible}
        dateKey={dateKey}
        onSelectDateKey={handlePickDateKey}
        onRequestClose={handleCloseDatePicker}
      />
      {aiAppendModal}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  container: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 120,
  },
  bulkDeleteButton: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#fee2e2',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  bulkDeleteLabel: {
    color: '#dc2626',
    fontWeight: '700',
  },
});
