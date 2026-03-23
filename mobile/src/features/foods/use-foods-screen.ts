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
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import { analyze } from '@/agents/analyze-agent';
import { createDraftFromEntry, createEntry, deleteEntry, listEntries, refreshFoodLibrary, updateEntry } from '@/agents/food-library-agent';
import { saveMeal } from '@/agents/save-meal-agent';
import { FoodItem, FoodLibraryEntry, calculateMacroFromItems } from '@/constants/schema';
import { useDietState } from '@/hooks/use-diet-state';
import { createId } from '@/lib/id';

const locale = 'ja-JP';

type AppendItemsResult = {
  items: FoodItem[];
  warnings: string[];
};

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
  formItems: FoodItem[];
  handleChangeFormItems: (items: FoodItem[]) => void;
  handleSaveEntry: () => Promise<void>;
  handleDeleteEntry: (entryId: string) => void;
  handleEatToday: (entryId: string) => Promise<void>;
  handleRequestAddFood: () => void;
  aiPromptText: string;
  setAiPromptText: (value: string) => void;
  aiPromptVisible: boolean;
  closeAiPromptModal: () => void;
  handleSubmitAiPrompt: () => Promise<void>;
  isEditingAnalyzing: boolean;
  reloadLibrary: () => Promise<void>;
};

/**
 * 食品タブ用の状態管理フック。
 * 呼び出し元: FoodsScreen。
 * @returns UseFoodsScreenResult UI 操作用の state と handler
 * @remarks 副作用: FoodLibraryAgent / SaveMealAgent への I/O が含まれる。
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
  const [aiPromptText, setAiPromptText] = useState('');
  const [aiPromptVisible, setAiPromptVisible] = useState(false);
  const [isEditingAnalyzing, setIsEditingAnalyzing] = useState(false);
  const timezone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);

  /**
   * FoodItem 配列からマクロ値を算出して state を更新する。
   * 呼び出し元: handleChangeFormItems / appendItemsToForm など。
   * @param items 更新対象の FoodItem 配列
   * @returns void
   * @remarks 副作用: calories / protein / fat / carbs の更新。
   */
  const syncMacrosFromItems = useCallback((items: FoodItem[]) => {
    const totals = calculateMacroFromItems(items);
    setCalories(String(Math.round(totals.kcal)));
    setProtein(String(Math.round(totals.protein)));
    setFat(String(Math.round(totals.fat)));
    setCarbs(String(Math.round(totals.carbs)));
  }, []);

  /**
   * 食品ライブラリをリロードする。
   * 呼び出し元: useEffect / useFocusEffect。
   * @returns Promise<void>
   * @remarks 副作用: isRefreshing と store の更新。
   */
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

  /**
   * フォーカス時にライブラリを同期する。
   * 呼び出し元: useFocusEffect。
   * @returns void
   * @remarks 副作用: refreshFoodLibrary の呼び出し。
   */
  const handleFocusReload = useCallback(() => {
    void reloadLibrary();
  }, [reloadLibrary]);

  useFocusEffect(handleFocusReload);

  const entries = useMemo(() => listEntries({ keyword, type: filter }), [filter, keyword, libraryState]);

  /**
   * フォームの FoodItem とマクロ値を同期する。
   * 呼び出し元: FoodEditorModal。
   * @param items 更新後のアイテム配列
   * @returns void
   * @remarks 副作用: formItems とマクロ値の更新。
   */
  const handleChangeFormItems = useCallback(
    (items: FoodItem[]) => {
      setFormItems(items);
      syncMacrosFromItems(items);
    },
    [syncMacrosFromItems],
  );

  /**
   * 新規エントリ編集を開く。
   * 呼び出し元: FoodFilterToolbar。
   * @returns void
   * @remarks 副作用: 編集フォーム state の更新。
   */
  const openNewEntryEditor = useCallback(() => {
    setEditingEntry(null);
    setName('');
    setAmount('1人前');
    setAiPromptVisible(false);
    const nextItems = [createManualItem()];
    setFormItems(nextItems);
    syncMacrosFromItems(nextItems);
    setEditorVisible(true);
  }, [syncMacrosFromItems]);

  /**
   * 既存エントリの編集を開く。
   * 呼び出し元: FoodEntryList。
   * @param entry 編集対象の FoodLibraryEntry
   * @returns void
   * @remarks 副作用: 編集フォーム state の更新。
   */
  const openEditor = useCallback(
    (entry: FoodLibraryEntry) => {
      setEditingEntry(entry);
      setName(entry.name);
      setAmount(entry.amount);
      setAiPromptVisible(false);
      const nextItems = entry.items.length > 0 ? entry.items.map((item) => ({ ...item })) : [createManualItem()];
      setFormItems(nextItems);
      syncMacrosFromItems(nextItems);
      setEditorVisible(true);
    },
    [syncMacrosFromItems],
  );

  /**
   * 編集モーダルを閉じる。
   * 呼び出し元: FoodEditorModal。
   * @returns void
   * @remarks 副作用: editorVisible の更新。
   */
  const closeEditor = useCallback(() => {
    setEditorVisible(false);
    setAiPromptVisible(false);
  }, []);

  /**
   * 編集フォームへ FoodItem を追加する。
   * 呼び出し元: AI追加系ハンドラ。
   * @param result 追加する FoodItem と警告
   * @returns void
   * @remarks 副作用: formItems とマクロ値の更新。
   */
  const appendItemsToForm = useCallback(
    ({ items, warnings }: AppendItemsResult) => {
      setFormItems((prev) => {
        const next = [...prev, ...items];
        syncMacrosFromItems(next);
        return next;
      });
      if (warnings.length > 0) {
        Alert.alert('注意', warnings.join('\n'));
      }
    },
    [syncMacrosFromItems],
  );

  /**
   * 手動で FoodItem を追加する。
   * 呼び出し元: handleRequestAddFood。
   * @returns void
   * @remarks 副作用: formItems の更新。
   */
  const handleAddFoodManual = useCallback(() => {
    setFormItems((prev) => {
      const next = [...prev, createManualItem()];
      syncMacrosFromItems(next);
      return next;
    });
  }, [syncMacrosFromItems]);

  /**
   * AI 追加用のプロンプトを開く。
   * 呼び出し元: handleRequestAddFood。
   * @returns void
   * @remarks 副作用: aiPromptVisible の更新。
   */
  const openAiPromptModal = useCallback(() => {
    setAiPromptText('');
    setAiPromptVisible(true);
  }, []);

  /**
   * AI 追加プロンプトを閉じる。
   * 呼び出し元: RecordAiAppendModal。
   * @returns void
   * @remarks 副作用: aiPromptVisible の更新。
   */
  const closeAiPromptModal = useCallback(() => setAiPromptVisible(false), []);

  /**
   * AI プロンプトから FoodItem を追加する。
   * 呼び出し元: RecordAiAppendModal。
   * @returns Promise<void>
   * @remarks 副作用: formItems の更新。
   */
  const handleSubmitAiPrompt = useCallback(async () => {
    if (!editorVisible) {
      Alert.alert('編集中の食品がありません');
      return;
    }
    if (!aiPromptText.trim()) {
      Alert.alert('入力が空です', '追加したい内容を入力してください。');
      return;
    }
    setIsEditingAnalyzing(true);
    try {
      const draft = await analyze({ type: 'text', prompt: aiPromptText, locale, timezone });
      appendItemsToForm({ items: draft.items, warnings: draft.warnings });
      setAiPromptVisible(false);
    } catch (error) {
      Alert.alert('解析に失敗しました', String((error as Error).message));
    } finally {
      setIsEditingAnalyzing(false);
    }
  }, [aiPromptText, appendItemsToForm, editorVisible, timezone]);

  /**
   * 画像解析結果をフォームへ追加する。
   * 呼び出し元: handleAddFoodImageFromCamera / handleAddFoodImageFromLibrary。
   * @param asset 画像アセット
   * @returns Promise<void>
   * @remarks 副作用: formItems の更新。
   */
  const appendImageAssetToForm = useCallback(
    async (asset: ImagePicker.ImagePickerAsset) => {
      if (!asset?.uri || !asset.base64) {
        Alert.alert('画像を取得できません', '画像の読み込みに失敗しました。');
        return;
      }
      setIsEditingAnalyzing(true);
      try {
        const draft = await analyze({ type: 'image', uri: asset.uri, base64: asset.base64, locale, timezone });
        appendItemsToForm({ items: draft.items, warnings: draft.warnings });
      } catch (error) {
        Alert.alert('画像解析に失敗しました', String((error as Error).message));
      } finally {
        setIsEditingAnalyzing(false);
      }
    },
    [appendItemsToForm, timezone],
  );

  /**
   * カメラ撮影で FoodItem を追加する。
   * 呼び出し元: handleRequestAddFood。
   * @returns Promise<void>
   * @remarks 副作用: formItems の更新。
   */
  const handleAddFoodImageFromCamera = useCallback(async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('カメラの許可が必要です');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({ allowsEditing: false, quality: 0.7, base64: true });
      if (result.canceled || !result.assets?.[0]) {
        return;
      }
      await appendImageAssetToForm(result.assets[0]);
    } catch (error) {
      Alert.alert('画像解析に失敗しました', String((error as Error).message));
    }
  }, [appendImageAssetToForm]);

  /**
   * ライブラリ選択で FoodItem を追加する。
   * 呼び出し元: handleRequestAddFood。
   * @returns Promise<void>
   * @remarks 副作用: formItems の更新。
   */
  const handleAddFoodImageFromLibrary = useCallback(async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('写真フォルダの許可が必要です');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.7,
        base64: true,
      });
      if (result.canceled || !result.assets?.[0]) {
        return;
      }
      await appendImageAssetToForm(result.assets[0]);
    } catch (error) {
      Alert.alert('画像解析に失敗しました', String((error as Error).message));
    }
  }, [appendImageAssetToForm]);

  /**
   * 追加方法の選択ダイアログを開く。
   * 呼び出し元: FoodEditorModal。
   * @returns void
   * @remarks 副作用: Alert 表示。
   */
  const handleRequestAddFood = useCallback(() => {
    if (!editorVisible) {
      Alert.alert('編集中の食品がありません');
      return;
    }
    Alert.alert('食品を追加', '追加方法を選択してください。', [
      {
        text: 'AIで追加',
        onPress: () => {
          Alert.alert('AIで追加', '追加方法を選択してください。', [
            { text: 'プロンプトで追加', onPress: openAiPromptModal },
            {
              text: '写真で追加',
              onPress: () => {
                Alert.alert('写真で追加', '取得方法を選択してください。', [
                  { text: '写真を撮影', onPress: () => void handleAddFoodImageFromCamera() },
                  { text: 'ライブラリから選ぶ', onPress: () => void handleAddFoodImageFromLibrary() },
                  { text: 'キャンセル', style: 'cancel' },
                ]);
              },
            },
            { text: 'キャンセル', style: 'cancel' },
          ]);
        },
      },
      { text: '手動で追加', onPress: handleAddFoodManual },
      { text: 'キャンセル', style: 'cancel' },
    ]);
  }, [editorVisible, handleAddFoodImageFromCamera, handleAddFoodImageFromLibrary, handleAddFoodManual, openAiPromptModal]);

  /**
   * エントリを保存する。
   * 呼び出し元: FoodEditorModal。
   * @returns Promise<void>
   * @remarks 副作用: FoodLibraryAgent への保存。
   */
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

  /**
   * エントリを削除する。
   * 呼び出し元: FoodEntryList。
   * @param entryId 削除対象 ID
   * @returns void
   * @remarks 副作用: Alert 表示とリロード。
   */
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

  /**
   * ライブラリエントリを履歴に追加する。
   * 呼び出し元: FoodEntryList。
   * @param entryId 追加対象 ID
   * @returns Promise<void>
   * @remarks 副作用: saveMeal の実行。
   */
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
  };
}

/**
 * 空の FoodItem を生成する。
 * 呼び出し元: openNewEntryEditor / handleAddFoodManual。
 * @returns FoodItem
 * @remarks 副作用は存在しない。
 */
function createManualItem(): FoodItem {
  return {
    id: createId('item'),
    name: '',
    category: 'unknown',
    amount: '1人前',
    kcal: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
  };
}
