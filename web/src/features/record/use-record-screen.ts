'use client';

/**
 * web/src/features/record/use-record-screen.ts
 *
 * 【責務】
 * Record 画面のローカル state、フォーム編集、見た目用サマリー計算をまとめる。
 *
 * 【使用されるエージェント / 処理フロー】
 * - features/record/record-screen.tsx から呼ばれる。
 * - use-record-form.ts の RHF 設定と field array を利用する。
 *
 * 【やらないこと】
 * - 永続化
 * - API 通信
 * - JSX 描画
 *
 * 【他ファイルとの関係】
 * - record-form-schema.ts の型を利用する。
 * - record-screen.tsx と各 UI コンポーネントへ state を渡す。
 */

import { useMemo, useState } from 'react';
import { useFieldArray, useWatch } from 'react-hook-form';

import {
  type RecordFoodItemValues,
  type RecordFormValues,
} from './record-form-schema';
import { useRecordForm } from './use-record-form';

type DailyMacroSummary = {
  label: string;
  current: number;
  target: number;
  remaining: number;
  tone: 'protein' | 'fat' | 'carbs';
  progress: number;
};

type DailySummary = {
  kcal: number;
  goalKcal: number;
  leftKcal: number;
  macros: DailyMacroSummary[];
};

const DAILY_SUMMARY: DailySummary = {
  kcal: 431,
  goalKcal: 2000,
  leftKcal: 1569,
  macros: [
    { label: 'Protein (P)', current: 49, target: 160, remaining: -111, tone: 'protein', progress: 30.6 },
    { label: 'Fat (F)', current: 13, target: 55, remaining: -42, tone: 'fat', progress: 23.6 },
    { label: 'Carbs (C)', current: 37, target: 210, remaining: -173, tone: 'carbs', progress: 17.6 },
  ],
};

function createEmptyItem(): RecordFoodItemValues {
  return {
    name: '',
    amount: '1人前',
    kcal: '0',
    protein: '0',
    fat: '0',
    carbs: '0',
  };
}

function toNumber(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function buildMealNameFromPrompt(prompt: string): string {
  const compact = prompt.replace(/\s+/g, ' ').trim();
  if (compact.length === 0) {
    return '';
  }

  return compact.length <= 18 ? compact : `${compact.slice(0, 18)}…`;
}

export type UseRecordScreenResult = {
  form: ReturnType<typeof useRecordForm>;
  itemFields: ReturnType<typeof useFieldArray<RecordFormValues, 'items'>>['fields'];
  dailySummary: DailySummary;
  draftTotals: {
    kcal: number;
    protein: number;
    fat: number;
    carbs: number;
  };
  feedbackMessage: string | null;
  handleApplyPrompt: () => void;
  handlePhotoRecord: () => void;
  handleAddItem: () => void;
  handleRemoveItem: (index: number) => void;
  handleConfirmDraft: () => void;
};

export function useRecordScreen(): UseRecordScreenResult {
  const form = useRecordForm();
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });
  const prompt = useWatch({ control: form.control, name: 'prompt' });
  const items = useWatch({ control: form.control, name: 'items' });

  const draftTotals = useMemo(() => {
    return (items ?? []).reduce(
      (totals, item) => ({
        kcal: totals.kcal + toNumber(item.kcal),
        protein: totals.protein + toNumber(item.protein),
        fat: totals.fat + toNumber(item.fat),
        carbs: totals.carbs + toNumber(item.carbs),
      }),
      { kcal: 0, protein: 0, fat: 0, carbs: 0 },
    );
  }, [items]);

  function handleApplyPrompt(): void {
    const trimmedPrompt = prompt.trim();

    if (trimmedPrompt.length === 0) {
      setFeedbackMessage('食事内容を入力すると、下の編集欄へ下書きを反映できます。');
      return;
    }

    if (form.getValues('mealName').trim().length === 0) {
      form.setValue('mealName', buildMealNameFromPrompt(trimmedPrompt));
    }

    if (form.getValues('items.0.name').trim().length === 0) {
      const firstToken = trimmedPrompt.split(/[、,\s]+/).filter(Boolean)[0] ?? '';
      form.setValue('items.0.name', firstToken);
    }

    setFeedbackMessage('テキスト入力を下書きへ反映しました。');
  }

  function handlePhotoRecord(): void {
    setFeedbackMessage('写真記録の導線は次に接続します。');
  }

  function handleAddItem(): void {
    append(createEmptyItem());
    setFeedbackMessage(null);
  }

  function handleRemoveItem(index: number): void {
    if (fields.length <= 1) {
      return;
    }

    remove(index);
    setFeedbackMessage(null);
  }

  function handleConfirmDraft(): void {
    setFeedbackMessage('この内容で確定する準備ができました。保存処理は次に接続します。');
  }

  return {
    form,
    itemFields: fields,
    dailySummary: DAILY_SUMMARY,
    draftTotals,
    feedbackMessage,
    handleApplyPrompt,
    handlePhotoRecord,
    handleAddItem,
    handleRemoveItem,
    handleConfirmDraft,
  };
}
