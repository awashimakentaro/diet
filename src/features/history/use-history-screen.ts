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
import { type JSX, useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';

import { deleteMeal, deleteMealsByDate, syncMealsByDate, updateMeal } from '@/agents/history-agent';
import { fetchGoal } from '@/agents/goal-agent';
import { createEntry } from '@/agents/food-library-agent';
import { useDailySummary } from '@/hooks/use-daily-summary';
import { useAiFoodAppend } from '@/hooks/use-ai-food-append';
import { FoodItem, Meal } from '@/constants/schema';
import { getTodayKey } from '@/lib/date';

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
  handleAiAppendEditingItems: () => void;
  aiAppendModal: JSX.Element | null;
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
  const timezone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);
  const { open: openAiAppendModal, modal: aiAppendModal } = useAiFoodAppend({ locale, timezone });

  useFocusEffect(
    useCallback(() => {
      fetchGoal().catch((error) => console.warn(error));
      syncMealsByDate(dateKey)
        .then(setMeals)
        .catch((error) => console.warn(error));
    }, [dateKey]),
  );

  const handleOpenEdit = useCallback((meal: Meal) => {
    setEditingMeal(meal);
    setEditingItems(meal.items.map((item) => ({ ...item })));
    setEditingMenuName(meal.menuName);
    setEditingOriginal(meal.originalText);
  }, []);

  const closeEditor = useCallback(() => setEditingMeal(null), []);

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

  const handleAiAppendEditingItems = useCallback(() => {
    if (!editingMeal) {
      Alert.alert('編集中の記録がありません');
      return;
    }
    openAiAppendModal({
      onDraft: (draft) => {
        setEditingItems((prev) => [...prev, ...draft.items]);
        if (draft.warnings.length > 0) {
          Alert.alert('注意', draft.warnings.join('\n'));
        }
      },
    });
  }, [editingMeal, openAiAppendModal]);

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
    handleAiAppendEditingItems,
    aiAppendModal,
  };
}
