/**
 * features/record/record-screen.tsx
 *
 * 【責務】
 * 記録タブの UI を構築し、カスタムフックから受け取った状態とイベントを適切なコンポーネントへ接続する。
 *
 * 【使用箇所】
 * - app/(tabs)/index.tsx からデフォルトエクスポートされる。
 *
 * 【やらないこと】
 * - 解析や保存などのドメインロジック実装
 *
 * 【他ファイルとの関係】
 * - useRecordScreen フックと RecordQuickInputCard などの UI コンポーネントを利用する。
 */

import type { JSX } from 'react';
import { useNavigation } from '@react-navigation/native';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RecordHeader } from './components/record-header';
import { RecordQuickInputCard } from './components/record-quick-input-card';
import { RecordSummaryCard } from './components/record-summary-card';
import { LibraryPickerModal } from './components/library-picker-modal';
import { RecordDraftConfirmModal } from './components/record-draft-confirm-modal';
import { RecordAiAppendModal } from './components/record-ai-append-modal';
import { useRecordScreen } from './use-record-screen';

/**
 * 記録タブ画面。
 * 呼び出し元: app/(tabs)/index.tsx。
 */
export function RecordScreen(): JSX.Element {
  const navigation = useNavigation();
  const {
    summary,
    inputText,
    setInputText,
    isAnalyzing,
    handleAnalyzeText,
    handleAnalyzeImage,
    openManualModal,
    activeDraft,
    draftModalVisible,
    closeDraftModal,
    handleConfirmDraft,
    handleChangeActiveDraftItems,
    handleChangeActiveDraftMenuName,
    handleRequestAddFood,
    aiPromptText,
    setAiPromptText,
    aiPromptVisible,
    closeAiPromptModal,
    handleSubmitAiPrompt,
    libraryEntries,
    libraryModalVisible,
    openLibraryModal,
    closeLibraryModal,
    handleSelectLibraryEntry,
  } = useRecordScreen();

  /**
   * 設定タブへ遷移する。
   * 呼び出し元: RecordHeader。
   * @returns void
   * @remarks 副作用: ナビゲーション実行。
   */
  const handlePressSettings = () => {
    navigation.navigate('settings' as never);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <RecordHeader onPressSettings={handlePressSettings} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.section}>
          <RecordSummaryCard summary={summary} />
        </View>
        <View style={styles.quickInputSection}>
          <RecordQuickInputCard
            value={inputText}
            onChangeText={setInputText}
            onSubmitText={handleAnalyzeText}
            onPressPhoto={handleAnalyzeImage}
            onPressManual={openManualModal}
            onOpenLibrary={openLibraryModal}
            isAnalyzing={isAnalyzing}
          />
        </View>
      </ScrollView>
      <LibraryPickerModal
        visible={libraryModalVisible}
        entries={libraryEntries}
        onSelectEntry={handleSelectLibraryEntry}
        onRequestClose={closeLibraryModal}
      />
      <RecordDraftConfirmModal
        visible={draftModalVisible}
        draft={activeDraft}
        onChangeMenuName={handleChangeActiveDraftMenuName}
        onChangeItems={handleChangeActiveDraftItems}
        onRequestAddFood={handleRequestAddFood}
        onRequestClose={closeDraftModal}
        onConfirm={handleConfirmDraft}
        isLoading={isAnalyzing}
      />
      <RecordAiAppendModal
        visible={aiPromptVisible}
        value={aiPromptText}
        onChangeText={setAiPromptText}
        onRequestClose={closeAiPromptModal}
        onSubmit={handleSubmitAiPrompt}
        isLoading={isAnalyzing}
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
  section: {
    marginBottom: 16,
  },
  quickInputSection: {
    marginBottom: 24,
  },
});
