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
 */

import type { JSX } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { FoodFilterToolbar } from './components/food-filter-toolbar';
import { FoodEntryList } from './components/food-entry-list';
import { FoodEditorModal } from './components/food-editor-modal';
import { FoodsHeader } from './components/foods-header';
import { useFoodsScreen } from './use-foods-screen';

/**
 * 食品タブ画面。
 */
export function FoodsScreen(): JSX.Element {
  const router = useRouter();
  const {
    entries,
    isRefreshing,
    keyword,
    setKeyword,
    openNewEntryEditor,
    openEditor,
    closeEditor,
    editorVisible,
    name,
    setName,
    amount,
    setAmount,
    calories,
    setCalories,
    protein,
    setProtein,
    fat,
    setFat,
    carbs,
    setCarbs,
    formItems,
    handleChangeFormItems,
    handleSaveEntry,
    handleDeleteEntry,
    handleEatToday,
    handleAiAppendFormItems,
    aiAppendModal,
    reloadLibrary,
  } = useFoodsScreen();

  /**
   * 設定タブへ遷移する。
   * 呼び出し元: FoodsHeader。
   * @returns void
   * @remarks 副作用: ナビゲーション実行。
   */
  const handlePressSettings = () => {
    router.push('/settings');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <FoodsHeader onPressSettings={handlePressSettings} />
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
        visible={editorVisible}
        name={name}
        amount={amount}
        calories={calories}
        protein={protein}
        fat={fat}
        carbs={carbs}
        items={formItems}
        onChangeName={setName}
        onChangeAmount={setAmount}
        onChangeCalories={setCalories}
        onChangeProtein={setProtein}
        onChangeFat={setFat}
        onChangeCarbs={setCarbs}
        onChangeItems={handleChangeFormItems}
        onRequestClose={closeEditor}
        onSubmit={handleSaveEntry}
        onRequestAiAppend={handleAiAppendFormItems}
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
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
});
