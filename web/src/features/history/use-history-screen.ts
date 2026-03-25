'use client';

/**
 * web/src/features/history/use-history-screen.ts
 *
 * 【責務】
 * History 画面の表示対象履歴とローカル操作 state をまとめる。
 *
 * 【使用されるエージェント / 処理フロー】
 * - history-screen.tsx から呼ばれる。
 * - mockMeals をベースに表示用データを整形する。
 *
 * 【やらないこと】
 * - API 通信
 * - 永続化
 * - JSX 描画
 *
 * 【他ファイルとの関係】
 * - web/src/data/mock-diet-data.ts の履歴データを利用する。
 * - history-entry-card.tsx へ state とハンドラを渡す。
 */

import { useMemo, useState } from 'react';

import { mockMeals } from '@/data/mock-diet-data';
import type { WebMeal } from '@/domain/web-diet-schema';

export type UseHistoryScreenResult = {
  meals: WebMeal[];
  selectedDateLabel: string;
  feedbackMessage: string | null;
  badgeCount: number;
  handleDeleteMeal: (mealId: string) => void;
  handleSaveMeal: (mealId: string) => void;
};

function getDateKey(value: string): string {
  return value.slice(0, 10);
}

export function useHistoryScreen(): UseHistoryScreenResult {
  const [hiddenMealIds, setHiddenMealIds] = useState<string[]>([]);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const selectedDateKey = getDateKey(mockMeals[0]?.recordedAt ?? new Date().toISOString());

  const meals = useMemo(() => {
    return mockMeals.filter((meal) => {
      return hiddenMealIds.includes(meal.id) === false && getDateKey(meal.recordedAt) === selectedDateKey;
    });
  }, [hiddenMealIds, selectedDateKey]);

  function handleDeleteMeal(mealId: string): void {
    setHiddenMealIds((current) => current.concat(mealId));
    setFeedbackMessage('履歴カードをローカルで非表示にしました。');
  }

  function handleSaveMeal(mealId: string): void {
    const targetMeal = mockMeals.find((meal) => meal.id === mealId);

    if (!targetMeal) {
      return;
    }

    setFeedbackMessage(`「${targetMeal.menuName}」を保存候補としてマークしました。`);
  }

  return {
    meals,
    selectedDateLabel: selectedDateKey,
    feedbackMessage,
    badgeCount: meals.length,
    handleDeleteMeal,
    handleSaveMeal,
  };
}
