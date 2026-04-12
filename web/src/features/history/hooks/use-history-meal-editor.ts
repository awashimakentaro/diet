/* 【責務】
 * History 編集パネルのフォーム状態と prompt 解析操作をまとめる。
 */

import { useEffect, useState } from 'react';
import { useFieldArray } from 'react-hook-form';

import type { WebMeal } from '@/domain/web-diet-schema';
import { usePromptAttachments } from '@/features/record/hooks/use-prompt-attachments';

import { requestHistoryMealAnalysis } from '../api/request-history-meal-analysis';
import type { HistoryMealEditorFormValues } from '../schemas/history-meal-editor-form-schema';
import { buildHistoryAnalysisEmptyFeedback } from '../usecases/analysis/build-history-analysis-empty-feedback';
import { buildHistoryAnalysisErrorFeedback } from '../usecases/analysis/build-history-analysis-error-feedback';
import { buildHistoryAnalysisFeedback } from '../usecases/analysis/build-history-analysis-feedback';
import { buildHistoryAnalysisItems } from '../usecases/analysis/build-history-analysis-items';
import { validateHistoryMealAnalysisInput } from '../usecases/analysis/validate-history-meal-analysis-input';
import { createHistoryMealEditorDefaultValues } from '../utils/create-history-meal-editor-default-values';
import { createEmptyHistoryMealItem } from '../utils/create-empty-history-meal-item';
import { useHistoryMealEditorForm } from './use-history-meal-editor-form';

type UseHistoryMealEditorParams = {
  meal: WebMeal;
  onSave: (values: HistoryMealEditorFormValues) => Promise<void>;
};

type UseHistoryMealEditorResult = {
  form: ReturnType<typeof useHistoryMealEditorForm>;
  itemFields: ReturnType<typeof useFieldArray<HistoryMealEditorFormValues, 'items'>>['fields'];
  isAnalyzing: boolean;
  feedbackMessage: string | null;
  attachments: ReturnType<typeof usePromptAttachments>['attachments'];
  handleAttachmentChange: ReturnType<typeof usePromptAttachments>['handleAttachmentChange'];
  handleRemoveAttachment: ReturnType<typeof usePromptAttachments>['handleRemoveAttachment'];
  handleSave: () => Promise<void>;
  handleApplyPrompt: () => Promise<void>;
  handleAddManualItem: () => void;
  handlePhotoRecord: () => void;
  handleRemoveItem: (index: number) => void;
};

export function useHistoryMealEditor({
  meal,
  onSave,
}: UseHistoryMealEditorParams): UseHistoryMealEditorResult {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const {
    attachments,
    handleAttachmentChange,
    handleRemoveAttachment,
    clearAttachments,
  } = usePromptAttachments();
  const form = useHistoryMealEditorForm(meal);
  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  useEffect(() => {
    const defaults = createHistoryMealEditorDefaultValues(meal);
    form.reset(defaults);
    replace(defaults.items);
    setFeedbackMessage(null);
    clearAttachments();
  }, [form, meal, replace]);

  async function handleSave(): Promise<void> {
    await onSave(form.getValues());
  }

  async function handleApplyPrompt(): Promise<void> {
    const prompt = form.getValues('prompt').trim();
    const validation = validateHistoryMealAnalysisInput({ prompt });

    if (!validation.ok) {
      setFeedbackMessage(validation.message);
      return;
    }

    setIsAnalyzing(true);

    try {
      const draft = await requestHistoryMealAnalysis({ prompt });
      const generatedItems = buildHistoryAnalysisItems(draft);

      if (generatedItems.length === 0) {
        const feedback = buildHistoryAnalysisEmptyFeedback();
        setFeedbackMessage(feedback.message);
        return;
      }

      append(generatedItems);
      form.setValue('prompt', '', { shouldDirty: false });
      const feedback = buildHistoryAnalysisFeedback({
        warning: draft.warnings[0] ?? null,
        itemCount: generatedItems.length,
      });
      setFeedbackMessage(feedback.message);
      clearAttachments();
    } catch (error) {
      const feedback = buildHistoryAnalysisErrorFeedback(error);
      setFeedbackMessage(feedback.message);
    } finally {
      setIsAnalyzing(false);
    }
  }

  function handleAddManualItem(): void {
    append(createEmptyHistoryMealItem());
    setFeedbackMessage(null);
  }

  function handlePhotoRecord(): void {
    setFeedbackMessage('写真解析は次の接続で対応します。');
  }

  function handleRemoveItem(index: number): void {
    if (fields.length <= 1) {
      return;
    }

    remove(index);
  }

  return {
    form,
    itemFields: fields,
    isAnalyzing,
    feedbackMessage,
    attachments,
    handleAttachmentChange,
    handleRemoveAttachment,
    handleSave,
    handleApplyPrompt,
    handleAddManualItem,
    handlePhotoRecord,
    handleRemoveItem,
  };
}
