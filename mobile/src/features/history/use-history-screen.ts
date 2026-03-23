/**
 * features/history/use-history-screen.ts
 *
 * 【責務】
 * 履歴タブで必要となる状態と操作を提供し、UI 側からのイベントを HistoryAgent 等に委譲する。
 *
 * 【使用箇所】
 * - HistoryScreen
 *
 * 【やらないこと】
 * - 直接的な UI 描画
 *
 * 【他ファイルとの関係】
 * - HistoryAgent や FoodLibraryAgent の API を呼び出す。
 */

import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import { analyze } from '@/agents/analyze-agent';
import { deleteMeal, deleteMealsByDate, syncMealsByDate, updateMeal } from '@/agents/history-agent';
import { fetchGoal } from '@/agents/goal-agent';
import { createEntry } from '@/agents/food-library-agent';
import { useDailySummary } from '@/hooks/use-daily-summary';
import { FoodItem, Meal } from '@/constants/schema';
import { getTodayKey } from '@/lib/date';
import { createId } from '@/lib/id';

const locale = 'ja-JP';

export type UseHistoryScreenResult = {
  dateKey: string;
  summary: ReturnType<typeof useDailySummary>;
  meals: Meal[];
  handleSelectDateKey: (dateKey: string) => void;
  handleOpenEdit: (meal: Meal) => void;
  handleDeleteMeal: (mealId: string) => void;
  handleDeleteAll: () => void;
  handleSaveToLibrary: (meal: Meal) => void;
  editingMeal: Meal | null;
  editingItems: FoodItem[];
  setEditingItems: (items: FoodItem[]) => void;
  editingMenuName: string;
  setEditingMenuName: (value: string) => void;
  editingOriginal: string;
  setEditingOriginal: (value: string) => void;
  handleSaveEdit: () => Promise<void>;
  closeEditor: () => void;
  handleRequestAddFood: () => void;
  aiPromptText: string;
  setAiPromptText: (value: string) => void;
  aiPromptVisible: boolean;
  closeAiPromptModal: () => void;
  handleSubmitAiPrompt: () => Promise<void>;
  isEditingAnalyzing: boolean;
};

/**
 * 履歴画面のロジックをまとめたフック。
 * 呼び出し元: HistoryScreen。
 */
export function useHistoryScreen(): UseHistoryScreenResult {
  const [dateKey, setDateKey] = useState(getTodayKey());
  const summary = useDailySummary(dateKey);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [editingItems, setEditingItems] = useState<FoodItem[]>([]);
  const [editingMenuName, setEditingMenuName] = useState('');
  const [editingOriginal, setEditingOriginal] = useState('');
  const [aiPromptText, setAiPromptText] = useState('');
  const [aiPromptVisible, setAiPromptVisible] = useState(false);
  const [isEditingAnalyzing, setIsEditingAnalyzing] = useState(false);
  const timezone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);

  /**
   * 画面フォーカス時に日次データを同期する。
   * 呼び出し元: useFocusEffect。
   * @returns void
   * @remarks 副作用: ゴール取得と meals の更新。
   */
  const handleFocusSync = useCallback(() => {
    fetchGoal().catch((error) => console.warn(error));
    syncMealsByDate(dateKey)
      .then(setMeals)
      .catch((error) => console.warn(error));
  }, [dateKey]);

  useFocusEffect(handleFocusSync);

  /**
   * 編集対象の Meal を開く。
   * 呼び出し元: HistoryScreen。
   * @param meal 編集対象の Meal
   * @returns void
   * @remarks 副作用: 編集 state の更新。
   */
  const handleOpenEdit = useCallback((meal: Meal) => {
    setEditingMeal(meal);
    setEditingItems(meal.items.map((item) => ({ ...item })));
    setEditingMenuName(meal.menuName);
    setEditingOriginal(meal.originalText);
    setAiPromptVisible(false);
  }, []);

  /**
   * 編集モーダルを閉じる。
   * 呼び出し元: EditMealModal。
   * @returns void
   * @remarks 副作用: editingMeal の更新。
   */
  const closeEditor = useCallback(() => setEditingMeal(null), []);

  /**
   * 編集内容を保存する。
   * 呼び出し元: EditMealModal。
   * @returns Promise<void>
   * @remarks 副作用: meals の更新と編集状態のクリア。
   */
  const handleSaveEdit = useCallback(async () => {
    if (!editingMeal) {
      return;
    }
    try {
      await updateMeal(editingMeal.id, {
        menuName: editingMenuName,
        originalText: editingOriginal,
        items: editingItems,
      });
      const refreshed = await syncMealsByDate(dateKey);
      setMeals(refreshed);
      closeEditor();
    } catch (error) {
      Alert.alert('更新できません', String((error as Error).message));
    }
  }, [closeEditor, dateKey, editingItems, editingMeal, editingMenuName, editingOriginal]);

  /**
   * 指定した Meal を削除する。
   * 呼び出し元: HistoryMealList。
   * @param mealId 対象 Meal ID
   * @returns void
   * @remarks 副作用: Alert 表示と meals の更新。
   */
  const handleDeleteMeal = useCallback(
    (mealId: string) => {
      Alert.alert('削除しますか？', 'この操作は取り消せません。', [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: () =>
            deleteMeal(mealId)
              .then(() => syncMealsByDate(dateKey))
              .then(setMeals)
              .catch((error) => Alert.alert('削除できません', String((error as Error).message))),
        },
      ]);
    },
    [dateKey],
  );

  /**
   * 選択日の記録をすべて削除する。
   * 呼び出し元: HistoryScreen。
   * @returns void
   * @remarks 副作用: Alert 表示と meals の更新。
   */
  const handleDeleteAll = useCallback(() => {
    Alert.alert(`${dateKey} を削除`, 'この日の記録をすべて削除しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除',
        style: 'destructive',
        onPress: () =>
          deleteMealsByDate(dateKey)
            .then(() => syncMealsByDate(dateKey))
            .then(setMeals)
            .catch((error) => Alert.alert('削除できません', String((error as Error).message))),
      },
    ]);
  }, [dateKey]);

  /**
   * Meal を食品ライブラリへ保存する。
   * 呼び出し元: HistoryMealList。
   * @param meal 保存対象の Meal
   * @returns void
   * @remarks 副作用: FoodLibraryAgent API 呼び出し。
   */
  const handleSaveToLibrary = useCallback((meal: Meal) => {
    createEntry({
      name: meal.menuName,
      amount: '1人前',
      calories: meal.totals.kcal,
      protein: meal.totals.protein,
      fat: meal.totals.fat,
      carbs: meal.totals.carbs,
      items: meal.items,
    })
      .then(() => Alert.alert('ライブラリに保存しました'))
      .catch((error) => Alert.alert('保存失敗', String((error as Error).message)));
  }, []);

  /**
   * 編集中の FoodItem に追加する。
   * 呼び出し元: AI 追加系ハンドラ。
   * @param newItems 追加する FoodItem
   * @param warnings 追加する警告
   * @returns void
   * @remarks 副作用: editingItems の更新。
   */
  const appendItemsToEditing = useCallback((newItems: FoodItem[], warnings: string[]) => {
    setEditingItems((prev) => [...prev, ...newItems]);
    if (warnings.length > 0) {
      Alert.alert('注意', warnings.join('\n'));
    }
  }, []);

  /**
   * 画像解析結果を編集中の FoodItem に追加する。
   * 呼び出し元: handleAddFoodImageFromCamera / handleAddFoodImageFromLibrary。
   * @param asset 画像アセット
   * @returns Promise<void>
   * @remarks 副作用: editingItems の更新。
   */
  const appendImageAssetToEditing = useCallback(
    async (asset: ImagePicker.ImagePickerAsset) => {
      if (!editingMeal) {
        return;
      }
      if (!asset?.uri || !asset.base64) {
        Alert.alert('画像を取得できません', '画像の読み込みに失敗しました。');
        return;
      }
      setIsEditingAnalyzing(true);
      try {
        const draft = await analyze({ type: 'image', uri: asset.uri, base64: asset.base64, locale, timezone });
        appendItemsToEditing(draft.items, draft.warnings);
      } catch (error) {
        Alert.alert('画像解析に失敗しました', String((error as Error).message));
      } finally {
        setIsEditingAnalyzing(false);
      }
    },
    [appendItemsToEditing, editingMeal, timezone],
  );

  /**
   * 手動で FoodItem を追加する。
   * 呼び出し元: handleRequestAddFood。
   * @returns void
   * @remarks 副作用: editingItems の更新。
   */
  const handleAddFoodManual = useCallback(() => {
    if (!editingMeal) {
      return;
    }
    setEditingItems((prev) => [...prev, createManualItem()]);
  }, [editingMeal]);

  /**
   * AI 追加プロンプトを開く。
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
   * @remarks 副作用: editingItems の更新。
   */
  const handleSubmitAiPrompt = useCallback(async () => {
    if (!editingMeal) {
      Alert.alert('編集中の記録がありません');
      return;
    }
    if (!aiPromptText.trim()) {
      Alert.alert('入力が空です', '追加したい内容を入力してください。');
      return;
    }
    setIsEditingAnalyzing(true);
    try {
      const draft = await analyze({ type: 'text', prompt: aiPromptText, locale, timezone });
      appendItemsToEditing(draft.items, draft.warnings);
      setAiPromptVisible(false);
    } catch (error) {
      Alert.alert('解析に失敗しました', String((error as Error).message));
    } finally {
      setIsEditingAnalyzing(false);
    }
  }, [aiPromptText, appendItemsToEditing, editingMeal, timezone]);

  /**
   * カメラ撮影で FoodItem を追加する。
   * 呼び出し元: handleRequestAddFood。
   * @returns Promise<void>
   * @remarks 副作用: editingItems の更新。
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
      await appendImageAssetToEditing(result.assets[0]);
    } catch (error) {
      Alert.alert('画像解析に失敗しました', String((error as Error).message));
    }
  }, [appendImageAssetToEditing]);

  /**
   * ライブラリ選択で FoodItem を追加する。
   * 呼び出し元: handleRequestAddFood。
   * @returns Promise<void>
   * @remarks 副作用: editingItems の更新。
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
      await appendImageAssetToEditing(result.assets[0]);
    } catch (error) {
      Alert.alert('画像解析に失敗しました', String((error as Error).message));
    }
  }, [appendImageAssetToEditing]);

  /**
   * 追加方法の選択ダイアログを開く。
   * 呼び出し元: EditMealModal。
   * @returns void
   * @remarks 副作用: Alert 表示。
   */
  const handleRequestAddFood = useCallback(() => {
    if (!editingMeal) {
      Alert.alert('編集中の記録がありません');
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
  }, [editingMeal, handleAddFoodImageFromCamera, handleAddFoodImageFromLibrary, handleAddFoodManual, openAiPromptModal]);

  /**
   * 指定した日付キーへ切り替える。
   * 呼び出し元: HistoryScreen。
   * @param nextDateKey `YYYY-MM-DD` の日付キー
   * @returns void
   * @remarks 副作用: dateKey の更新。
   */
  const handleSelectDateKey = useCallback((nextDateKey: string) => {
    setDateKey(nextDateKey);
  }, []);

  return {
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
  };
}

/**
 * 空の FoodItem を生成する。
 * 呼び出し元: handleAddFoodManual。
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
