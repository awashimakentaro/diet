'use client';

/**
 * web/src/features/record/use-record-screen.ts
 *
 * 【責務】
 * Record 画面のローカル state とフォーム編集状態をまとめる。
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

import { applyRecordAnalysisToForm } from './apply-record-analysis';
import {
  type RecordFoodItemValues,
  type RecordFormValues,
} from './record-form-schema';
import { requestRecordAnalysis } from './request-record-analysis';
import { useRecordForm } from './use-record-form';

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

type WorkspaceMode = 'idle' | 'manual' | 'generated';

export type UseRecordScreenResult = {
  form: ReturnType<typeof useRecordForm>;
  itemFields: ReturnType<typeof useFieldArray<RecordFormValues, 'items'>>['fields'];
  workspaceMode: WorkspaceMode;
  isAnalyzing: boolean;
  promptGuideMessage: string | null;
  draftTotals: {
    kcal: number;
    protein: number;
    fat: number;
    carbs: number;
  };
  feedbackMessage: string | null;
  handleApplyPrompt: () => void;
  handleOpenManualInput: () => void;
  handleCloseManualInput: () => void;
  handlePhotoRecord: () => void;
  handleAddItem: () => void;
  handleRemoveItem: (index: number) => void;
  handleConfirmDraft: () => void;
};

export function useRecordScreen(): UseRecordScreenResult {
  const form = useRecordForm();
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>('idle');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const { fields, append, remove, replace } = useFieldArray({
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

  const promptGuideMessage = useMemo(() => {
    const hasMeaningfulDraft =
      workspaceMode !== 'idle'
      && (form.getValues('mealName').trim().length > 0
        || (items ?? []).some((item) => item.name.trim().length > 0));

    if (!hasMeaningfulDraft) {
      return null;
    }

    return 'さらに食品を追加したい場合は、食材名や料理名を入力して送信すると、いまのカードに候補を追加できます。';
  }, [form, items, workspaceMode]);

  async function handleApplyPrompt(): Promise<void> {
    const trimmedPrompt = prompt.trim();

    if (trimmedPrompt.length === 0) {
      setFeedbackMessage('食事内容を入力すると、下の編集欄へ下書きを反映できます。');
      return;
    }

    setIsAnalyzing(true);

    try {
      const draft = await requestRecordAnalysis({ prompt: trimmedPrompt });
      const shouldAppend =
        workspaceMode !== 'idle'
        && (form.getValues('mealName').trim().length > 0
          || (items ?? []).some((item) => item.name.trim().length > 0));

      applyRecordAnalysisToForm({
        form,
        replaceItems: replace,
        currentItems: shouldAppend ? items ?? [] : [],
        draft,
        mode: shouldAppend ? 'append' : 'replace',
      });

      setWorkspaceMode('generated');
      setFeedbackMessage(
        draft.warnings[0]
          ?? (shouldAppend
            ? 'AI が推定した食品候補を既存カードへ追加しました。'
            : 'AI が推定した栄養情報を下書きカードへ反映しました。'),
      );
    } catch (error) {
      if (form.getValues('mealName').trim().length === 0) {
        form.setValue('mealName', buildMealNameFromPrompt(trimmedPrompt));
      }

      if (form.getValues('items.0.name').trim().length === 0) {
        const firstToken = trimmedPrompt.split(/[、,\s]+/).filter(Boolean)[0] ?? '';
        form.setValue('items.0.name', firstToken);
      }

      setWorkspaceMode('generated');
      setFeedbackMessage(
        error instanceof Error
          ? error.message
          : '解析に失敗したため、簡易的な下書きを表示しています。',
      );
    } finally {
      setIsAnalyzing(false);
    }
  }

  function handlePhotoRecord(): void {
    setFeedbackMessage(null);
  }

  function handleOpenManualInput(): void {
    setWorkspaceMode('manual');
    setFeedbackMessage(null);
  }

  function handleCloseManualInput(): void {
    setWorkspaceMode('idle');
    setFeedbackMessage(null);
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
    workspaceMode,
    isAnalyzing,
    promptGuideMessage,
    draftTotals,
    feedbackMessage,
    handleApplyPrompt,
    handleOpenManualInput,
    handleCloseManualInput,
    handlePhotoRecord,
    handleAddItem,
    handleRemoveItem,
    handleConfirmDraft,
  };
}
