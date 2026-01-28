/**
 * features/foods/foods-screen.tsx
 *
 * 【責務】
 * 食品タブの画面を構築し、フィルター・一覧・編集モーダルを組み合わせる。
 *
 * 【使用箇所】
 * - app/(tabs)/foods.tsx
 *
 * 【やらないこと】
 * - FoodLibraryAgent のロジック実装
 *
 * 【他ファイルとの関係】
 * - useFoodsScreen と各 UI コンポーネントを結合する。
 */

import type { JSX } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FoodFilterToolbar } from './components/food-filter-toolbar';
import { FoodEntryList } from './components/food-entry-list';
import { FoodEditorModal } from './components/food-editor-modal';
import { FoodsHeader } from './components/foods-header';
import { useFoodsScreen } from './use-foods-screen';
import { RecordAiAppendModal } from '../record/components/record-ai-append-modal';

/**
 * 食品タブ画面を描画する。
 * 呼び出し元: app/(tabs)/foods.tsx。
 * @returns JSX.Element
 * @remarks 副作用は存在しない。
 */
export function FoodsScreen(): JSX.Element {
  const {
    entries,
    isRefreshing,
    keyword,
    setKeyword,
    openNewEntryEditor,
    openEditor,
    closeEditor,
    editorVisible,
    editingEntry,
    name,
    setName,
    formItems,
    handleChangeFormItems,
    handleSaveEntry,
    handleDeleteEntry,
    handleEatToday,
    handleRequestAddFood,
    aiPromptText,
    setAiPromptText,
    aiPromptVisible,
    closeAiPromptModal,
    handleSubmitAiPrompt,
    isEditingAnalyzing,
    reloadLibrary,
  } = useFoodsScreen();

  return (
    <SafeAreaView style={styles.safeArea}>
      <FoodsHeader />
      <View style={styles.container}>
        <FoodFilterToolbar
          keyword={keyword}
          onChangeKeyword={setKeyword}
          onPressAdd={openNewEntryEditor}
        />
        <FoodEntryList
          entries={entries}
          isRefreshing={isRefreshing}
          onRefresh={reloadLibrary}
          onEdit={openEditor}
          onDelete={handleDeleteEntry}
          onEatToday={(entryId) => void handleEatToday(entryId)}
        />
      </View>
      <FoodEditorModal
        visible={editorVisible && !aiPromptVisible}
        title={editingEntry ? '食品を編集' : '食品を追加'}
        name={name}
        items={formItems}
        onChangeName={setName}
        onChangeItems={handleChangeFormItems}
        onRequestAddFood={handleRequestAddFood}
        onRequestClose={closeEditor}
        onSubmit={handleSaveEntry}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
});
