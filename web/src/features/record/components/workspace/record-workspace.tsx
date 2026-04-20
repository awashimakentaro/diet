/* 【責務】
 * Record 画面の workspace 内に表示する内容を切り替えて描画する。
 */

import type { ChangeEvent, JSX } from 'react';
import type { FieldArrayWithId, UseFormRegisterReturn, UseFormReturn } from 'react-hook-form';

import type { MealFormValues as RecordFormValues } from '@/features/shared/meal-editor/schemas';
import type { PromptAttachment } from '@/features/shared/meal-editor/hooks/use-prompt-attachments';
import { RecordEditorPanel } from '../editor/record-editor-panel';
import { RecordWorkspaceLoading } from './record-workspace-loading';
import { RecordWorkspacePlaceholder } from './record-workspace-placeholder';

type RecordWorkspaceProps = {
  workspaceMode: 'idle' | 'manual' | 'generated';
  isAnalyzing: boolean;
  isSaving: boolean;
  form: UseFormReturn<RecordFormValues>;
  itemFields: FieldArrayWithId<RecordFormValues, 'items', 'id'>[];
  draftTotals: {
    kcal: number;
    protein: number;
    fat: number;
    carbs: number;
  };
  feedbackMessage: string | null;
  feedbackTone: 'info' | 'error';
  promptRegistration: UseFormRegisterReturn;
  attachments: PromptAttachment[];
  onAddItem: () => void;
  onApplyPrompt: () => void | Promise<void>;
  onPhotoRecord: () => void;
  onClose: () => void;
  onRemoveItem: (index: number) => void;
  onConfirm: () => void;
  onAttachmentChange: (event: ChangeEvent<HTMLInputElement>) => boolean;
  onRemoveAttachment: (attachmentId: string) => void;
};

export function RecordWorkspace({
  workspaceMode,
  isAnalyzing,
  isSaving,
  form,
  itemFields,
  draftTotals,
  feedbackMessage,
  feedbackTone,
  promptRegistration,
  attachments,
  onAddItem,
  onApplyPrompt,
  onPhotoRecord,
  onClose,
  onRemoveItem,
  onConfirm,
  onAttachmentChange,
  onRemoveAttachment,
}: RecordWorkspaceProps): JSX.Element {
  if (isAnalyzing) {
    return <RecordWorkspaceLoading />;
  }

  if (workspaceMode === 'idle') {
    return <RecordWorkspacePlaceholder />;
  }

  return (
    <RecordEditorPanel
      attachments={attachments}
      draftTotals={draftTotals}
      feedbackMessage={feedbackMessage}
      feedbackTone={feedbackTone}
      form={form}
      isAnalyzing={isAnalyzing}
      isSaving={isSaving}
      itemFields={itemFields}
      mode={workspaceMode}
      onAddItem={onAddItem}
      onApplyPrompt={onApplyPrompt}
      onAttachmentChange={onAttachmentChange}
      onClose={onClose}
      onConfirm={onConfirm}
      onPhotoRecord={onPhotoRecord}
      onRemoveAttachment={onRemoveAttachment}
      onRemoveItem={onRemoveItem}
      promptRegistration={promptRegistration}
    />
  );
}
