/* 【責務】
 * Record 編集パネルの下部アクション領域を描画する。
 */

import { CheckCircle2 } from 'lucide-react';
import type { ChangeEvent, JSX } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

import type { PromptAttachment } from '../../hooks/use-prompt-attachments';
import { RecordItemAddPanel } from './record-item-add-panel';

type RecordEditorActionsProps = {
  isAnalyzing: boolean;
  isSaving: boolean;
  feedbackMessage: string | null;
  feedbackTone: 'info' | 'error';
  promptRegistration: UseFormRegisterReturn;
  onAddItem: () => void;
  onApplyPrompt: () => void | Promise<void>;
  onPhotoRecord: () => void;
  onConfirm: () => void;
  attachments: PromptAttachment[];
  onAttachmentChange: (event: ChangeEvent<HTMLInputElement>) => boolean;
  onRemoveAttachment: (attachmentId: string) => void;
};

export function RecordEditorActions({
  isAnalyzing,
  isSaving,
  feedbackMessage,
  feedbackTone,
  promptRegistration,
  onAddItem,
  onApplyPrompt,
  onPhotoRecord,
  onConfirm,
  attachments,
  onAttachmentChange,
  onRemoveAttachment,
}: RecordEditorActionsProps): JSX.Element {
  return (
    <>
      <RecordItemAddPanel
        isAnalyzing={isAnalyzing}
        onAddManualItem={onAddItem}
        onApplyPrompt={onApplyPrompt}
        onPhotoRecord={onPhotoRecord}
        promptRegistration={promptRegistration}
        attachments={attachments}
        onAttachmentChange={onAttachmentChange}
        onRemoveAttachment={onRemoveAttachment}
      />

      {feedbackMessage !== null ? (
        <p
          className={
            feedbackTone === 'error'
              ? 'record-screen__feedback record-screen__feedback--error'
              : 'record-screen__feedback'
          }
        >
          {feedbackMessage}
        </p>
      ) : null}

      <button
        className={isSaving ? 'record-screen__confirm-button record-screen__confirm-button--loading' : 'record-screen__confirm-button'}
        disabled={isSaving}
        onClick={onConfirm}
        type="button"
      >
        {isSaving ? (
          <>
            <span className="record-screen__loading-spinner record-screen__loading-spinner--inline" />
            <span>保存中です...</span>
          </>
        ) : (
          <>
            <span>この内容で確定する</span>
            <CheckCircle2 size={20} strokeWidth={2.2} />
          </>
        )}
      </button>
    </>
  );
}
