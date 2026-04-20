/* 【責務】
 * Record 画面の状態と処理フローを接続する。
 */

import { useState } from 'react';
import { useFieldArray, useWatch, type FieldArrayWithId } from 'react-hook-form';
import type { MealFormValues as RecordFormValues } from '@/features/shared/meal-editor/schemas';
import { usePromptAttachments } from '@/features/shared/meal-editor/hooks/use-prompt-attachments';
import { createEmptyRecordItem } from '../../utils/create-empty-record-item';
import { useRecordDraftTotals } from './use-record-draft-totals';
import { useRecordScreenFeedback } from './use-record-screen-feedback';
import { useRecordForm } from '../use-record-form';
import { useRecordScreenPrompt } from './use-record-screen-prompt';
import { useRecordScreenSave } from './use-record-screen-save';

type WorkspaceMode = 'idle' | 'manual' | 'generated';
type FeedbackTone = 'info' | 'error';
type RecordItemField = FieldArrayWithId<RecordFormValues, 'items', 'id'>;

export type UseRecordScreenResult = {
  workspace: {
    form: ReturnType<typeof useRecordForm>;
    itemFields: RecordItemField[];
    workspaceMode: WorkspaceMode;
    isAnalyzing: boolean;
    isSaving: boolean;
    attachments: ReturnType<typeof usePromptAttachments>['attachments'];
    draftTotals: {
      kcal: number;
      protein: number;
      fat: number;
      carbs: number;
    };
    feedbackMessage: string | null;
    feedbackTone: FeedbackTone;
    handleCloseManualInput: () => void;
    handleAttachmentChange: ReturnType<typeof usePromptAttachments>['handleAttachmentChange'];
    handleRemoveAttachment: ReturnType<typeof usePromptAttachments>['handleRemoveAttachment'];
    handleAddItem: () => void;
    handleRemoveItem: (index: number) => void;
    handleConfirmDraft: () => void;
  };
  quickInput: {
    workspaceMode: WorkspaceMode;
    isAnalyzing: boolean;
    attachments: ReturnType<typeof usePromptAttachments>['attachments'];
    handleOpenManualInput: () => void;
    handlePhotoRecord: () => void;
    handleAttachmentChange: ReturnType<typeof usePromptAttachments>['handleAttachmentChange'];
    handleRemoveAttachment: ReturnType<typeof usePromptAttachments>['handleRemoveAttachment'];
  };
  prompt: {
    handleApplyPrompt: () => void;
  };
};

export function useRecordScreen(): UseRecordScreenResult {
  const form = useRecordForm();
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>('idle');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [draftOriginalText, setDraftOriginalText] = useState('');
  const { attachments, handleAttachmentChange, handleRemoveAttachment, clearAttachments } = usePromptAttachments();
  const {
    feedbackMessage,
    feedbackTone,
    setFeedback,
    resetFeedback,
  } = useRecordScreenFeedback();
  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const prompt = useWatch({ control: form.control, name: 'prompt' });
  const items = useWatch({ control: form.control, name: 'items' });
  const draftTotals = useRecordDraftTotals(items);
  const { handleApplyPrompt } = useRecordScreenPrompt({
    form,
    prompt,
    items,
    attachments,
    workspaceMode,
    draftOriginalText,
    replaceItems: replace,
    clearAttachments,
    setIsAnalyzing,
    setDraftOriginalText,
    setWorkspaceMode,
    setFeedback,
  });
  const { handleConfirmDraft } = useRecordScreenSave({
    form,
    workspaceMode,
    draftOriginalText,
    replaceItems: replace,
    setIsSaving,
    setDraftOriginalText,
    setWorkspaceMode,
    setFeedback,
  });

  function handlePhotoRecord(): void {
    resetFeedback();
  }

  function handleOpenManualInput(): void {
    setWorkspaceMode('manual');
    setDraftOriginalText('');
    resetFeedback();
  }

  function handleCloseManualInput(): void {
    setWorkspaceMode('idle');
    setDraftOriginalText('');
    resetFeedback();
  }

  function handleAddItem(): void {
    append(createEmptyRecordItem());
    resetFeedback();
  }

  function handleRemoveItem(index: number): void {
    if (fields.length <= 1) {
      return;
    }

    remove(index);
    resetFeedback();
  }

  return {
    workspace: {
      form,
      itemFields: fields,
      workspaceMode,
      isAnalyzing,
      isSaving,
      attachments,
      draftTotals,
      feedbackMessage,
      feedbackTone,
      handleCloseManualInput,
      handleAttachmentChange,
      handleRemoveAttachment,
      handleAddItem,
      handleRemoveItem,
      handleConfirmDraft,
    },
    quickInput: {
      workspaceMode,
      isAnalyzing,
      attachments,
      handleOpenManualInput,
      handlePhotoRecord,
      handleAttachmentChange,
      handleRemoveAttachment,
    },
    prompt: {
      handleApplyPrompt,
    },
  };
}

// - append
//     すでに何か入ってるカードに、AI結果を追加する
//   - replace
//     まだ実質空のカードなので、AI結果で入れ替える　まぁ初めてプロンプト打った時ってことだね

//   append になるのは、
//   - manual で手入力中のカードに中身があるとき
//   - generated でAI作成済みカードに中身があるとき

//   replace になるのは、
//   - idle のときカードはあるけど中身がほぼ空のとき
