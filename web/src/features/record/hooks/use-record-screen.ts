/* 【責務】
 * Record 画面のローカル state とフォーム編集状態をまとめる。
 */

import { useMemo, useState } from 'react';
import { useFieldArray, useWatch } from 'react-hook-form';

import { fileToBase64 } from '@/utils/file-to-base64';
import { requestRecordAnalysis } from '../api/request-record-analysis';
import { saveRecordMeal } from '../api/save-record-meal';
import { type RecordFormValues } from '../schemas/record-form-schema';
import { applyRecordAnalysisToForm } from '../usecases/apply-record-analysis';
import { createEmptyRecordItem } from '../utils/create-empty-record-item';
import { getTodayDateKey } from '../utils/get-today-date-key';
import { usePromptAttachments, type PromptAttachment } from './use-prompt-attachments';
import { useRecordForm } from './use-record-form';
import { validateRecordDraft } from '../usecases/validate-record-draft';

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
    const hasAttachments = attachments.length > 0;

    if (trimmedPrompt.length === 0 && !hasAttachments) {
      setFeedbackMessage('食事内容または写真を追加すると、下の編集欄へ下書きを反映できます。');
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
          return trimmedPrompt.length > 0 ? `${current}\n${trimmedPrompt}` : current;
        }

        return trimmedPrompt;
      });

      setWorkspaceMode('generated');
      setFeedbackMessage(
        draft.warnings[0]
        ?? (shouldAppend
          ? 'AI が推定した食品候補を既存カードへ追加しました。'
          : hasAttachments
            ? 'AI が写真から推定した栄養情報を下書きカードへ反映しました。'
            : 'AI が推定した栄養情報を下書きカードへ反映しました。'),
      );
      setFeedbackTone(draft.warnings[0] ? 'error' : 'info');
      setAttachments([]);
    } catch (error) {
      if (trimmedPrompt.length > 0 && form.getValues('mealName').trim().length === 0) {
        form.setValue('mealName', buildMealNameFromPrompt(trimmedPrompt));
      }

      if (trimmedPrompt.length > 0 && form.getValues('items.0.name').trim().length === 0) {
        const firstToken = trimmedPrompt.split(/[、,\s]+/).filter(Boolean)[0] ?? '';
        form.setValue('items.0.name', firstToken);
      }
      setDraftOriginalText((current) => {
        if (trimmedPrompt.length === 0) {
          return current;
        }

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
      if (hasAttachments) {
        setAttachments([]);
      }
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
    append(createEmptyRecordItem());
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
    const validation = validateRecordDraft(values);
    if (!validation.ok) {
      setFeedbackMessage(validation.error);
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
      replace([createEmptyRecordItem()]);
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
