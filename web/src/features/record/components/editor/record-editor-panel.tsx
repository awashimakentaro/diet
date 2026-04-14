/* 【責務】
 * Record 編集パネル全体を組み立てて描画する。
 */

import type { JSX } from 'react';
import type { FieldArrayWithId, UseFormRegisterReturn, UseFormReturn } from 'react-hook-form';

import type { ChangeEvent } from 'react';
import type { PromptAttachment } from '../../hooks/use-prompt-attachments';
import type { RecordFormValues } from '../../schemas/record-form-schema';
import { RecordEditorActions } from './record-editor-actions';
import { RecordEditorDetailsFields } from './record-editor-details-fields';
import { RecordEditorItemList } from './record-editor-item-list';
import { RecordDraftSummary } from './record-draft-summary';
import { RecordEditorTopbar } from './record-editor-topbar';

type RecordEditorPanelProps = {
  mode: 'manual' | 'generated';
  form: UseFormReturn<RecordFormValues>;
  itemFields: FieldArrayWithId<RecordFormValues, 'items', 'id'>[];
  draftTotals: {
    kcal: number;
    protein: number;
    fat: number;
    carbs: number;
  };
  isAnalyzing: boolean;
  isSaving: boolean;
  feedbackMessage: string | null;
  feedbackTone: 'info' | 'error';
  promptRegistration: UseFormRegisterReturn;
  onAddItem: () => void;
  onApplyPrompt: () => void | Promise<void>;
  onPhotoRecord: () => void;
  onClose: () => void;
  onRemoveItem: (index: number) => void;
  onConfirm: () => void;
  attachments: PromptAttachment[];
  onAttachmentChange: (event: ChangeEvent<HTMLInputElement>) => boolean;
  onRemoveAttachment: (attachmentId: string) => void;
};

export function RecordEditorPanel({
  mode,
  form,
  itemFields,
  draftTotals,
  isAnalyzing,
  isSaving,
  feedbackMessage,
  feedbackTone,
  promptRegistration,
  onAddItem,
  onApplyPrompt,
  onPhotoRecord,
  onClose,
  onRemoveItem,
  onConfirm,
  attachments,
  onAttachmentChange,
  onRemoveAttachment,
}: RecordEditorPanelProps): JSX.Element {
  return (
    <section className="record-screen__editor-shell">
      <div className="record-screen__editor">
        <RecordEditorTopbar
          mode={mode}
          onClose={onClose}
        />

        <div className="record-screen__editor-body">
          <RecordEditorDetailsFields form={form} />

          <div className="record-screen__field-group">
            <label className="record-screen__field-label">内訳の詳細</label>
            <RecordDraftSummary totals={draftTotals} />

            <RecordEditorItemList
              itemFields={itemFields}
              mode={mode}
              onRemoveItem={onRemoveItem}
              register={form.register}
            />
            <RecordEditorActions
              attachments={attachments}
              feedbackMessage={feedbackMessage}
              feedbackTone={feedbackTone}
              isAnalyzing={isAnalyzing}
              isSaving={isSaving}
              onAddItem={onAddItem}
              onApplyPrompt={onApplyPrompt}
              onAttachmentChange={onAttachmentChange}
              onConfirm={onConfirm}
              onPhotoRecord={onPhotoRecord}
              onRemoveAttachment={onRemoveAttachment}
              promptRegistration={promptRegistration}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
