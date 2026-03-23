/**
 * features/record/use-record-screen.ts
 *
 * 【責務】
 * 記録タブにおける状態管理とアクションをまとめ、UI コンポーネントへ渡すためのカスタムフックを提供する。
 *
 * 【使用箇所】
 * - RecordScreen コンポーネント
 *
 * 【やらないこと】
 * - JSX を返す UI の描画
 *
 * 【他ファイルとの関係】
 * - agents ディレクトリの API を呼び出し、副作用を委譲する。
 */

import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import { analyze } from '@/agents/analyze-agent';
import { fetchGoal } from '@/agents/goal-agent';
import { refreshFoodLibrary, toMealDraft } from '@/agents/food-library-agent';
import { fetchNotificationSetting } from '@/agents/notification-agent';
import { saveMeal } from '@/agents/save-meal-agent';
import { syncMealsByDate } from '@/agents/history-agent';
import { AnalyzeDraft, FoodItem, FoodLibraryEntry, calculateMacroFromItems } from '@/constants/schema';
import { getTodayKey } from '@/lib/date';
import { consumeDraftInbox } from '@/lib/diet-store';
import { createId } from '@/lib/id';
import { logEvent, logScreen } from '@/lib/analytics';
import { useDailySummary } from '@/hooks/use-daily-summary';
import { useDietState } from '@/hooks/use-diet-state';

const locale = 'ja-JP';

export type UseRecordScreenResult = {
  summary: ReturnType<typeof useDailySummary>;
  inputText: string;
  setInputText: (value: string) => void;
  isAnalyzing: boolean;
  drafts: AnalyzeDraft[];
  activeDraft: AnalyzeDraft | null;
  draftModalVisible: boolean;
  handleAnalyzeText: () => Promise<void>;
  handleAnalyzeImage: () => void;
  openManualModal: () => void;
  closeDraftModal: () => void;
  handleConfirmDraft: () => Promise<void>;
  handleChangeActiveDraftItems: (items: FoodItem[]) => void;
  handleChangeActiveDraftMenuName: (menuName: string) => void;
  handleRequestAddFood: (draftId: string) => void;
  aiPromptText: string;
  setAiPromptText: (value: string) => void;
  aiPromptVisible: boolean;
  closeAiPromptModal: () => void;
  handleSubmitAiPrompt: () => Promise<void>;
  libraryEntries: FoodLibraryEntry[];
  libraryModalVisible: boolean;
  openLibraryModal: () => void;
  closeLibraryModal: () => void;
  handleSelectLibraryEntry: (entryId: string) => void;
};

/**
 * 記録画面向けの状態とロジックをまとめたフック。
 * 呼び出し元: RecordScreen。
 * @returns 表示用 state とイベントハンドラ
 */
export function useRecordScreen(): UseRecordScreenResult {
  const todayKey = getTodayKey();
  const summary = useDailySummary(todayKey);
  const timezone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);
  const [inputText, setInputText] = useState('');
  const [drafts, setDrafts] = useState<AnalyzeDraft[]>(() => consumeDraftInbox());
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  const [aiPromptText, setAiPromptText] = useState('');
  const [aiPromptVisible, setAiPromptVisible] = useState(false);
  const [libraryModalVisible, setLibraryModalVisible] = useState(false);
  const foodLibrary = useDietState((state) => state.foodLibrary);
  const activeDraft = useMemo(
    () => drafts.find((draft) => draft.draftId === activeDraftId) ?? null,
    [activeDraftId, drafts],
  );

  useFocusEffect(
    useCallback(() => {
      void logScreen('Record', { date_key: todayKey });
      fetchGoal().catch((error) => console.warn(error));
      fetchNotificationSetting().catch((error) => console.warn(error));
      refreshFoodLibrary().catch((error) => console.warn(error));
      syncMealsByDate(todayKey).catch((error) => console.warn(error));
      const queued = consumeDraftInbox();
      if (queued.length > 0) {
        setDrafts((prev) => [...queued, ...prev]);
        setActiveDraftId((current) => current ?? queued[0].draftId);
      }
    }, [todayKey]),
  );

  /**
   * Draft を先頭に追加し、編集対象として選択する。
   * 呼び出し元: 各種 Draft 生成ハンドラ。
   * @param draft 追加する Draft
   * @returns void
   * @remarks 副作用: drafts と activeDraftId の更新。
   */
  const prependDraft = useCallback((draft: AnalyzeDraft) => {
    setDrafts((prev) => [draft, ...prev]);
    setActiveDraftId(draft.draftId);
  }, []);

  const handleAnalyzeText = useCallback(async () => {
    if (!inputText.trim()) {
      Alert.alert('入力が空です', '記録した内容を入力してください。');
      return;
    }
    try {
      setIsAnalyzing(true);
      const draft = await analyze({ type: 'text', prompt: inputText, locale, timezone });
      prependDraft(draft);
      setInputText('');
      void logEvent('record_text_analyze_success', {
        item_count: draft.items.length,
        warning_count: draft.warnings.length,
        source: draft.source,
      });
    } catch (error) {
      Alert.alert('解析に失敗しました', String((error as Error).message));
    } finally {
      setIsAnalyzing(false);
    }
  }, [inputText, prependDraft, timezone]);

  const analyzeImageAsset = useCallback(
    async (asset: ImagePicker.ImagePickerAsset) => {
      if (!asset?.uri || !asset.base64) {
        Alert.alert('画像を取得できません', '画像の読み込みに失敗しました。');
        return;
      }
      setIsAnalyzing(true);
      try {
        const draft = await analyze({ type: 'image', uri: asset.uri, base64: asset.base64, locale, timezone });
        prependDraft(draft);
      } catch (error) {
        Alert.alert('画像解析に失敗しました', String((error as Error).message));
      } finally {
        setIsAnalyzing(false);
      }
    },
    [prependDraft, timezone],
  );

  /**
   * Draft へアイテムを追加する。
   * 呼び出し元: AI 追加系ハンドラ。
   * @param draftId 対象 Draft ID
   * @param newItems 追加する FoodItem
   * @param warnings 追加する警告
   * @returns void
   * @remarks 副作用: drafts の更新。
   */
  const appendItemsToDraft = useCallback((draftId: string, newItems: FoodItem[], warnings: string[]) => {
    setDrafts((prev) =>
      prev.map((draft) => {
        if (draft.draftId !== draftId) {
          return draft;
        }
        const mergedItems = [...draft.items, ...newItems];
        const mergedWarnings = warnings.length > 0 ? [...draft.warnings, ...warnings] : draft.warnings;
        return { ...draft, items: mergedItems, totals: calculateMacroFromItems(mergedItems), warnings: mergedWarnings };
      }),
    );
  }, []);

  /**
   * 画像解析結果をアクティブ Draft に追加する。
   * 呼び出し元: handleAddFoodImageFromCamera / handleAddFoodImageFromLibrary。
   * @param asset 画像アセット
   * @returns Promise<void>
   * @remarks 副作用: Draft の更新。
   */
  const appendImageAssetToActiveDraft = useCallback(
    async (asset: ImagePicker.ImagePickerAsset) => {
      if (!activeDraftId) {
        return;
      }
      if (!asset?.uri || !asset.base64) {
        Alert.alert('画像を取得できません', '画像の読み込みに失敗しました。');
        return;
      }
      setIsAnalyzing(true);
      try {
        const draft = await analyze({ type: 'image', uri: asset.uri, base64: asset.base64, locale, timezone });
        appendItemsToDraft(activeDraftId, draft.items, draft.warnings);
      } catch (error) {
        Alert.alert('画像解析に失敗しました', String((error as Error).message));
      } finally {
        setIsAnalyzing(false);
      }
    },
    [activeDraftId, appendItemsToDraft, timezone],
  );

  const handleAnalyzeImageFromCamera = useCallback(async () => {
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
      await analyzeImageAsset(result.assets[0]);
    } catch (error) {
      Alert.alert('画像解析に失敗しました', String((error as Error).message));
    }
  }, [analyzeImageAsset]);

  const handleAnalyzeImageFromLibrary = useCallback(async () => {
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
      await analyzeImageAsset(result.assets[0]);
    } catch (error) {
      Alert.alert('画像解析に失敗しました', String((error as Error).message));
    }
  }, [analyzeImageAsset]);

  const handleAnalyzeImage = useCallback(() => {
    Alert.alert('画像解析', '写真の取得方法を選択してください。', [
      { text: '写真を撮影', onPress: () => void handleAnalyzeImageFromCamera() },
      { text: 'ライブラリから選ぶ', onPress: () => void handleAnalyzeImageFromLibrary() },
      { text: 'キャンセル', style: 'cancel' },
    ]);
  }, [handleAnalyzeImageFromCamera, handleAnalyzeImageFromLibrary]);

  /**
   * 手動入力用の Draft を生成して編集モーダルを開く。
   * 呼び出し元: RecordQuickInputCard。
   * @returns void
   * @remarks 副作用: Draft 追加と activeDraftId の更新。
   */
  const openManualModal = useCallback(() => {
    const draft = buildManualDraft({ menuName: '', items: [createManualItem()] });
    prependDraft(draft);
  }, [prependDraft]);

  /**
   * Draft 編集モーダルを閉じる。
   * 呼び出し元: RecordDraftConfirmModal。
   * @returns void
   * @remarks 副作用: Draft の破棄と activeDraftId の更新。
   */
  const closeDraftModal = useCallback(() => {
    setDrafts((prev) => {
      if (!activeDraftId) {
        return prev;
      }
      const next = prev.filter((draft) => draft.draftId !== activeDraftId);
      setActiveDraftId(next[0]?.draftId ?? null);
      return next;
    });
  }, [activeDraftId]);

  /**
   * アクティブ Draft を保存して履歴へ追加する。
   * 呼び出し元: RecordDraftConfirmModal。
   * @returns void
   * @remarks 副作用: 保存・Alert・Draft 削除・activeDraftId 更新。
   */
  const handleConfirmDraft = useCallback(async () => {
    if (!activeDraft) {
      return;
    }
    const normalizedDraft = activeDraft.source === 'manual' ? normalizeManualDraftForSave(activeDraft) : activeDraft;
    try {
      await saveMeal({ draft: normalizedDraft });
      setDrafts((prev) => {
        const next = prev.filter((item) => item.draftId !== activeDraft.draftId);
        setActiveDraftId(next[0]?.draftId ?? null);
        return next;
      });
      Alert.alert('保存しました', `${normalizedDraft.menuName || 'メニュー'} を履歴へ追加しました。`);
      void logEvent('record_meal_saved', {
        item_count: normalizedDraft.items.length,
        total_kcal: normalizedDraft.totals.kcal,
        source: normalizedDraft.source,
      });
    } catch (error) {
      Alert.alert('保存できません', String((error as Error).message));
    }
  }, [activeDraft]);

  const handleUpdateDraftItems = useCallback((draftId: string, items: FoodItem[]) => {
    setDrafts((prev) =>
      prev.map((draft) => (draft.draftId === draftId ? { ...draft, items, totals: calculateMacroFromItems(items) } : draft)),
    );
  }, []);

  const handleUpdateDraftMenuName = useCallback((draftId: string, menuName: string) => {
    setDrafts((prev) => prev.map((draft) => (draft.draftId === draftId ? { ...draft, menuName } : draft)));
  }, []);

  /**
   * アクティブ Draft のメニュー名を更新する。
   * 呼び出し元: RecordDraftConfirmModal。
   * @param menuName 更新後メニュー名
   * @returns void
   * @remarks 副作用: drafts の更新。
   */
  const handleChangeActiveDraftMenuName = useCallback(
    (menuName: string) => {
      if (!activeDraftId) {
        return;
      }
      handleUpdateDraftMenuName(activeDraftId, menuName);
    },
    [activeDraftId, handleUpdateDraftMenuName],
  );

  /**
   * アクティブ Draft のアイテムを更新する。
   * 呼び出し元: RecordDraftConfirmModal。
   * @param items FoodItem 配列
   * @returns void
   * @remarks 副作用: drafts の更新。
   */
  const handleChangeActiveDraftItems = useCallback(
    (items: FoodItem[]) => {
      if (!activeDraftId) {
        return;
      }
      handleUpdateDraftItems(activeDraftId, items);
    },
    [activeDraftId, handleUpdateDraftItems],
  );

  const openLibraryModal = useCallback(() => setLibraryModalVisible(true), []);
  const closeLibraryModal = useCallback(() => setLibraryModalVisible(false), []);

  const handleSelectLibraryEntry = useCallback(
    (entryId: string) => {
      try {
        const draft = toMealDraft(entryId);
        prependDraft(draft);
        closeLibraryModal();
      } catch (error) {
        Alert.alert('ライブラリ読込失敗', String((error as Error).message));
      }
    },
    [closeLibraryModal, prependDraft],
  );

  /**
   * 手動で FoodItem を追加する。
   * 呼び出し元: handleRequestAddFood。
   * @returns void
   * @remarks 副作用: drafts の更新。
   */
  const handleAddFoodManual = useCallback(() => {
    if (!activeDraftId) {
      return;
    }
    const newItem = createManualItem();
    setDrafts((prev) =>
      prev.map((draft) => {
        if (draft.draftId !== activeDraftId) {
          return draft;
        }
        const nextItems = [...draft.items, newItem];
        return { ...draft, items: nextItems, totals: calculateMacroFromItems(nextItems) };
      }),
    );
  }, [activeDraftId]);

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
   * @remarks 副作用: Draft の更新。
   */
  const handleSubmitAiPrompt = useCallback(async () => {
    if (!activeDraftId) {
      return;
    }
    if (!aiPromptText.trim()) {
      Alert.alert('入力が空です', '追加したい内容を入力してください。');
      return;
    }
    setIsAnalyzing(true);
    try {
      const draft = await analyze({ type: 'text', prompt: aiPromptText, locale, timezone });
      appendItemsToDraft(activeDraftId, draft.items, draft.warnings);
      setAiPromptVisible(false);
    } catch (error) {
      Alert.alert('解析に失敗しました', String((error as Error).message));
    } finally {
      setIsAnalyzing(false);
    }
  }, [activeDraftId, aiPromptText, appendItemsToDraft, timezone]);

  /**
   * カメラ撮影で FoodItem を追加する。
   * 呼び出し元: handleRequestAddFood。
   * @returns Promise<void>
   * @remarks 副作用: Draft の更新。
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
      await appendImageAssetToActiveDraft(result.assets[0]);
    } catch (error) {
      Alert.alert('画像解析に失敗しました', String((error as Error).message));
    }
  }, [appendImageAssetToActiveDraft]);

  /**
   * ライブラリ選択で FoodItem を追加する。
   * 呼び出し元: handleRequestAddFood。
   * @returns Promise<void>
   * @remarks 副作用: Draft の更新。
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
      await appendImageAssetToActiveDraft(result.assets[0]);
    } catch (error) {
      Alert.alert('画像解析に失敗しました', String((error as Error).message));
    }
  }, [appendImageAssetToActiveDraft]);

  /**
   * 追加方法の選択ダイアログを開く。
   * 呼び出し元: RecordDraftConfirmModal。
   * @param draftId 対象 Draft ID
   * @returns void
   * @remarks 副作用: Alert 表示。
   */
  const handleRequestAddFood = useCallback((draftId: string) => {
    if (!draftId) {
      return;
    }
    setActiveDraftId(draftId);
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
  }, [handleAddFoodManual, handleAddFoodImageFromCamera, handleAddFoodImageFromLibrary, openAiPromptModal]);

  return {
    summary,
    inputText,
    setInputText,
    isAnalyzing,
    drafts,
    activeDraft,
    draftModalVisible: Boolean(activeDraft) && !aiPromptVisible,
    handleAnalyzeText,
    handleAnalyzeImage,
    openManualModal,
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
    libraryEntries: foodLibrary,
    libraryModalVisible,
    openLibraryModal,
    closeLibraryModal,
    handleSelectLibraryEntry,
  };
}

/**
 * 手動入力フォームから Draft を生成する。
 * 呼び出し元: useRecordScreen。
 * @param form 手動入力の値
 * @returns AnalyzeDraft
 * @remarks 副作用は存在しない。
 */
function buildManualDraft(form: { menuName: string; items: FoodItem[] }): AnalyzeDraft {
  const baseItems = form.items.length > 0 ? form.items : [createManualItem()];
  return {
    draftId: createId('draft'),
    menuName: form.menuName,
    originalText: form.menuName,
    items: baseItems,
    totals: calculateMacroFromItems(baseItems),
    source: 'manual',
    warnings: [],
  };
}

/**
 * 手動 Draft を保存用に正規化する。
 * 呼び出し元: handleConfirmDraft。
 * @param draft 編集中の Draft
 * @returns 正規化済み Draft
 * @remarks 副作用は存在しない。
 */
function normalizeManualDraftForSave(draft: AnalyzeDraft): AnalyzeDraft {
  const normalizedItems = normalizeManualItems(draft.items);
  const fallbackName = normalizedItems[0]?.name ?? '新しいメニュー';
  const menuName = draft.menuName.trim() || fallbackName;
  return {
    ...draft,
    menuName,
    originalText: menuName,
    items: normalizedItems,
    totals: calculateMacroFromItems(normalizedItems),
  };
}

/**
 * 手動入力用の空アイテムを生成する。
 * 呼び出し元: useRecordScreen。
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

/**
 * 手動入力の FoodItem を正規化する。
 * 呼び出し元: buildManualDraft。
 * @param items 入力アイテム
 * @returns 正規化済み配列
 * @remarks 副作用は存在しない。
 */
function normalizeManualItems(items: FoodItem[]): FoodItem[] {
  if (items.length === 0) {
    return [createManualItem()];
  }
  return items.map((item, index) => ({
    ...item,
    name: item.name.trim() || `食品${index + 1}`,
    amount: item.amount.trim() || '1人前',
    kcal: normalizeManualNumber(item.kcal),
    protein: normalizeManualNumber(item.protein),
    fat: normalizeManualNumber(item.fat),
    carbs: normalizeManualNumber(item.carbs),
  }));
}

/**
 * 手動入力の数値を正規化する。
 * 呼び出し元: normalizeManualItems。
 * @param value 数値
 * @returns 正規化後の数値
 * @remarks 副作用は存在しない。
 */
function normalizeManualNumber(value: number): number {
  return Number.isFinite(value) ? value : 0;
}
