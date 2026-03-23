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
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DateNavigator } from './components/date-navigator';
import { HistoryDatePickerModal } from './components/history-date-picker-modal';
import { HistoryHeader } from './components/history-header';
import { HistoryMealList } from './components/history-meal-list';
import { EditMealModal } from './components/edit-meal-modal';
import { RecordAiAppendModal } from '../record/components/record-ai-append-modal';
import { RecordSummaryCard } from '../record/components/record-summary-card';
import { useHistoryScreen } from './use-history-screen';

/**
 * 履歴タブ画面。
 * 呼び出し元: app/(tabs)/history.tsx。
 */
export function HistoryScreen(): JSX.Element {
  const {
    dateKey,
    summary,
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
    handleRequestAddFood,
    aiPromptText,
    setAiPromptText,
    aiPromptVisible,
    closeAiPromptModal,
    handleSubmitAiPrompt,
    isEditingAnalyzing,
  } = useHistoryScreen();
  const [datePickerVisible, setDatePickerVisible] = useState(false);

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
      <HistoryHeader />
      <ScrollView contentContainerStyle={styles.container}>
        <DateNavigator dateKey={dateKey} onOpenPicker={handleOpenDatePicker} />
        <RecordSummaryCard summary={summary} />
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
        visible={Boolean(editingMeal) && !aiPromptVisible}
        menuName={editingMenuName}
        originalText={editingOriginal}
        items={editingItems}
        onChangeMenuName={setEditingMenuName}
        onChangeOriginalText={setEditingOriginal}
        onChangeItems={setEditingItems}
        onRequestAddFood={handleRequestAddFood}
        onRequestClose={closeEditor}
        onSubmit={handleSaveEdit}
        isLoading={isEditingAnalyzing}
      />
      <RecordAiAppendModal
        visible={aiPromptVisible}
        value={aiPromptText}
        onChangeText={setAiPromptText}
        onRequestClose={closeAiPromptModal}
        onSubmit={handleSubmitAiPrompt}
        isLoading={isEditingAnalyzing}
      />
      <HistoryDatePickerModal
        visible={datePickerVisible}
        dateKey={dateKey}
        onSelectDateKey={handlePickDateKey}
        onRequestClose={handleCloseDatePicker}
      />
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
