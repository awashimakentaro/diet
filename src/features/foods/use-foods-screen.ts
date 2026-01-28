/**
 * features/foods/use-foods-screen.ts
 *
 * 【責務】
 * 食品タブの状態・イベント・フォーム値を管理し、UI コンポーネントから呼び出しやすくする。
 *
 * 【使用箇所】
 * - FoodsScreen
 *
 * 【やらないこと】
 * - UI の描画
 *
 * 【他ファイルとの関係】
 * - FoodLibraryAgent や SaveMealAgent を呼び出す。
 */

import { useFocusEffect } from '@react-navigation/native';
import { type JSX, useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';

import { createDraftFromEntry, createEntry, deleteEntry, listEntries, refreshFoodLibrary, updateEntry } from '@/agents/food-library-agent';
import { saveMeal } from '@/agents/save-meal-agent';
import { FoodItem, FoodLibraryEntry, calculateMacroFromItems } from '@/constants/schema';
import { useDietState } from '@/hooks/use-diet-state';
import { useAiFoodAppend } from '@/hooks/use-ai-food-append';

const locale = 'ja-JP';

export type FoodTypeFilter = 'all' | 'single' | 'menu';

export type UseFoodsScreenResult = {
  entries: FoodLibraryEntry[];
  isRefreshing: boolean;
  keyword: string;
  setKeyword: (value: string) => void;
  filter: FoodTypeFilter;
  setFilter: (value: FoodTypeFilter) => void;
  openNewEntryEditor: () => void;
  openEditor: (entry: FoodLibraryEntry) => void;
  closeEditor: () => void;
  editorVisible: boolean;
  editingEntry: FoodLibraryEntry | null;
  name: string;
  setName: (value: string) => void;
  amount: string;
  setAmount: (value: string) => void;
  calories: string;
  setCalories: (value: string) => void;
  protein: string;
  setProtein: (value: string) => void;
  fat: string;
  setFat: (value: string) => void;
  carbs: string;
  setCarbs: (value: string) => void;
  formItems: FoodItem[];
  setFormItems: (items: FoodItem[]) => void;
  handleChangeFormItems: (items: FoodItem[]) => void;
  handleSaveEntry: () => Promise<void>;
  handleDeleteEntry: (entryId: string) => void;
  handleEatToday: (entryId: string) => Promise<void>;
  handleAiAppendFormItems: () => void;
  aiAppendModal: JSX.Element | null;
  reloadLibrary: () => Promise<void>;
};

/**
 * 食品タブ用の状態管理フック。
 * 呼び出し元: FoodsScreen。
 */
export function useFoodsScreen(): UseFoodsScreenResult {
  const libraryState = useDietState((state) => state.foodLibrary);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [filter, setFilter] = useState<FoodTypeFilter>('all');
  const [editorVisible, setEditorVisible] = useState(false);
  const [editingEntry, setEditingEntry] = useState<FoodLibraryEntry | null>(null);
  const [formItems, setFormItems] = useState<FoodItem[]>([]);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('1人前');
  const [calories, setCalories] = useState('0');
  const [protein, setProtein] = useState('0');
  const [fat, setFat] = useState('0');
  const [carbs, setCarbs] = useState('0');
  const timezone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);
  const { open: openAiAppendModal, modal: aiAppendModal } = useAiFoodAppend({ locale, timezone });

  const reloadLibrary = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshFoodLibrary();
    } catch (error) {
      console.warn(error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void reloadLibrary();
  }, [reloadLibrary]);

  useFocusEffect(
    useCallback(() => {
      void reloadLibrary();
    }, [reloadLibrary]),
  );

  const entries = useMemo(() => listEntries({ keyword, type: filter }), [filter, keyword, libraryState]);

  const openNewEntryEditor = useCallback(() => {
    setEditingEntry(null);
    setName('');
    setAmount('1人前');
    setCalories('0');
    setProtein('0');
    setFat('0');
    setCarbs('0');
    setFormItems([]);
    setEditorVisible(true);
  }, []);

  const openEditor = useCallback((entry: FoodLibraryEntry) => {
    setEditingEntry(entry);
    setName(entry.name);
    setAmount(entry.amount);
    setCalories(String(entry.calories));
    setProtein(String(entry.protein));
    setFat(String(entry.fat));
    setCarbs(String(entry.carbs));
    setFormItems(entry.items.map((item) => ({ ...item })));
    setEditorVisible(true);
  }, []);

  const closeEditor = useCallback(() => setEditorVisible(false), []);

  const handleAiAppendFormItems = useCallback(() => {
    openAiAppendModal({
      onDraft: (draft) => {
        handleChangeFormItems([...formItems, ...draft.items]);
        if (draft.warnings.length > 0) {
          Alert.alert('注意', draft.warnings.join('\n'));
        }
      },
    });
  }, [formItems, handleChangeFormItems, openAiAppendModal]);

  const handleSaveEntry = useCallback(async () => {
    const payload = {
      name,
      amount,
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
      fat: Number(fat) || 0,
      carbs: Number(carbs) || 0,
      items: formItems,
    };
    try {
      if (editingEntry) {
        await updateEntry(editingEntry.id, payload);
      } else {
        await createEntry(payload);
      }
      await reloadLibrary();
      closeEditor();
    } catch (error) {
      Alert.alert('保存に失敗しました', String((error as Error).message));
    }
  }, [amount, calories, carbs, closeEditor, editingEntry, formItems, name, protein, fat, reloadLibrary]);

  const handleDeleteEntry = useCallback(
    (entryId: string) => {
      Alert.alert('削除しますか？', 'この食品を削除します。', [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: () =>
            deleteEntry(entryId)
              .then(() => reloadLibrary())
              .catch((error) => Alert.alert('削除失敗', String((error as Error).message))),
        },
      ]);
    },
    [reloadLibrary],
  );

  const handleEatToday = useCallback(async (entryId: string) => {
    try {
      const draft = createDraftFromEntry(entryId);
      await saveMeal({ draft });
      Alert.alert('履歴に追加しました');
    } catch (error) {
      Alert.alert('追加できません', String((error as Error).message));
    }
  }, []);

  return {
    entries,
    isRefreshing,
    keyword,
    setKeyword,
    filter,
    setFilter,
    openNewEntryEditor,
    openEditor,
    closeEditor,
    editorVisible,
    editingEntry,
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
    setFormItems,
    handleChangeFormItems,
    handleSaveEntry,
    handleDeleteEntry,
    handleEatToday,
    handleAiAppendFormItems,
    aiAppendModal,
    reloadLibrary,
  };
}
  /**
   * フォームの食品アイテムとマクロ値を同期する。
   * 呼び出し元: FoodEditorModal / AI追加。
   * @param items 更新後のアイテム配列
   * @returns void
   * @remarks 副作用: formItems と macro の更新。
   */
  const handleChangeFormItems = useCallback((items: FoodItem[]) => {
    setFormItems(items);
    const totals = calculateMacroFromItems(items);
    setCalories(String(Math.round(totals.kcal)));
    setProtein(String(Math.round(totals.protein)));
    setFat(String(Math.round(totals.fat)));
    setCarbs(String(Math.round(totals.carbs)));
  }, []);
