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
 * - 解析取得は request-record-analysis.ts、保存は save-record-meal.ts へ委譲する。
 *
 * 【やらないこと】
 * - JSX 描画
 *
 * 【他ファイルとの関係】
 * - record-form-schema.ts の型を利用する。
 * - record-screen.tsx と各 UI コンポーネントへ state を渡す。
 */

import { useMemo, useState } from 'react';
import { useFieldArray, useWatch } from 'react-hook-form';

import { fileToBase64 } from '@/utils/file-to-base64';
import { applyRecordAnalysisToForm } from './apply-record-analysis';
import {
  type RecordFoodItemValues,
  type RecordFormValues,
} from './record-form-schema';
import { requestRecordAnalysis } from './request-record-analysis';
import { saveRecordMeal } from './save-record-meal';
import { usePromptAttachments, type PromptAttachment } from './use-prompt-attachments';
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

function getTodayDateKey(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

type WorkspaceMode = 'idle' | 'manual' | 'generated';
type FeedbackTone = 'info' | 'error';

export type UseRecordScreenResult = {
  form: ReturnType<typeof useRecordForm>;
  itemFields: ReturnType<typeof useFieldArray<RecordFormValues, 'items'>>['fields'];
  workspaceMode: WorkspaceMode;
  isAnalyzing: boolean;
  isSaving: boolean;
  promptGuideMessage: string | null;
  attachments: ReturnType<typeof usePromptAttachments>['attachments'];
  draftTotals: {
    kcal: number;
    protein: number;
    fat: number;
    carbs: number;
  };
  feedbackMessage: string | null;
  feedbackTone: FeedbackTone;
  handleApplyPrompt: () => void;
  handleOpenManualInput: () => void;
  handleCloseManualInput: () => void;
  handlePhotoRecord: () => void;
  handleAttachmentChange: ReturnType<typeof usePromptAttachments>['handleAttachmentChange'];
  handleRemoveAttachment: ReturnType<typeof usePromptAttachments>['handleRemoveAttachment'];
  handleAddItem: () => void;
  handleRemoveItem: (index: number) => void;
  handleConfirmDraft: () => void;
};

export function useRecordScreen(): UseRecordScreenResult {
  const form = useRecordForm();
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>('idle');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [feedbackTone, setFeedbackTone] = useState<FeedbackTone>('info');
  const [draftOriginalText, setDraftOriginalText] = useState('');
  const { attachments, handleAttachmentChange, handleRemoveAttachment, setAttachments } = usePromptAttachments() as any; // Temporary cast for setAttachments
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
      setFeedbackTone('error');
      return;
    }

    setIsAnalyzing(true);

    try {
      const imageUrls = await Promise.all(
        attachments.map(async (a: PromptAttachment) => {
          const res = await fetch(a.previewUrl);
          const blob = await res.blob();
          return fileToBase64(blob);
        }),
      );

      const draft = await requestRecordAnalysis({
        prompt: trimmedPrompt,
        images: imageUrls.length > 0 ? imageUrls : undefined,
      });

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
      setDraftOriginalText((current) => {
        if (shouldAppend && current.trim().length > 0) {
          return `${current}\n${trimmedPrompt}`;
        }

        return trimmedPrompt;
      });

      setWorkspaceMode('generated');
      setFeedbackMessage(
        draft.warnings[0]
        ?? (shouldAppend
          ? 'AI が推定した食品候補を既存カードへ追加しました。'
          : 'AI が推定した栄養情報を下書きカードへ反映しました。'),
      );
      setFeedbackTone(draft.warnings[0] ? 'error' : 'info');
    } catch (error) {
      if (form.getValues('mealName').trim().length === 0) {
        form.setValue('mealName', buildMealNameFromPrompt(trimmedPrompt));
      }

      if (form.getValues('items.0.name').trim().length === 0) {
        const firstToken = trimmedPrompt.split(/[、,\s]+/).filter(Boolean)[0] ?? '';
        form.setValue('items.0.name', firstToken);
      }
      setDraftOriginalText((current) => {
        if (current.trim().length > 0) {
          return `${current}\n${trimmedPrompt}`;
        }

        return trimmedPrompt;
      });

      setWorkspaceMode('generated');
      setFeedbackMessage(
        error instanceof Error
          ? error.message
          : '解析に失敗したため、簡易的な下書きを表示しています。',
      );
      setFeedbackTone('error');
    } finally {
      setIsAnalyzing(false);
    }
  }

  function handlePhotoRecord(): void {
    setFeedbackMessage(null);
    setFeedbackTone('info');
  }

  function handleOpenManualInput(): void {
    setWorkspaceMode('manual');
    setDraftOriginalText('');
    setFeedbackMessage(null);
    setFeedbackTone('info');
  }

  function handleCloseManualInput(): void {
    setWorkspaceMode('idle');
    setDraftOriginalText('');
    setFeedbackMessage(null);
    setFeedbackTone('info');
  }

  function handleAddItem(): void {
    append(createEmptyItem());
    setFeedbackMessage(null);
    setFeedbackTone('info');
  }

  function handleRemoveItem(index: number): void {
    if (fields.length <= 1) {
      return;
    }

    remove(index);
    setFeedbackMessage(null);
    setFeedbackTone('info');
  }

  async function handleConfirmDraft(): Promise<void> {
    const values = {
      recordedDate: form.getValues('recordedDate'),
      mealName: form.getValues('mealName'),
      items: form.getValues('items'),
    };
    const hasAnyInput =
      values.mealName.trim().length > 0
      || values.items.some(
        (item) => item.name.trim().length > 0 || item.amount.trim().length > 0,
      );

    if (!hasAnyInput) {
      setFeedbackMessage('入力がありません。食品カードを1件以上入力してください。');
      setFeedbackTone('error');
      return;
    }

    setIsSaving(true);

    try {
      await saveRecordMeal({
        values,
        originalText: draftOriginalText,
        source: workspaceMode === 'generated' ? 'text' : 'manual',
      });

      form.setValue('prompt', '', { shouldDirty: false });
      form.setValue('recordedDate', getTodayDateKey(), { shouldDirty: false });
      form.setValue('mealName', '', { shouldDirty: false });
      replace([createEmptyItem()]);
      setDraftOriginalText('');
      setWorkspaceMode('idle');
      setFeedbackMessage('履歴に保存しました。');
      setFeedbackTone('info');
    } catch (error) {
      setFeedbackMessage(
        error instanceof Error
          ? error.message
          : '履歴へ保存できませんでした。',
      );
      setFeedbackTone('error');
    } finally {
      setIsSaving(false);
    }
  }

  return {
    form,
    itemFields: fields,
    workspaceMode,
    isAnalyzing,
    isSaving,
    promptGuideMessage,
    attachments,
    draftTotals,
    feedbackMessage,
    feedbackTone,
    handleApplyPrompt,
    handleOpenManualInput,
    handleCloseManualInput,
    handlePhotoRecord,
    handleAttachmentChange,
    handleRemoveAttachment,
    handleAddItem,
    handleRemoveItem,
    handleConfirmDraft,
  };
}

