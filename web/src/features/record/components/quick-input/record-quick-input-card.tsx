/* 【責務】
 * Record 画面のクイック入力カードを描画する。
 */

'use client';

import { PenLine, Send } from 'lucide-react';
import type { ChangeEvent, JSX } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

import type { PromptAttachment } from '../../hooks/use-prompt-attachments';
import { RecordPhotoInputTools } from '../shared/record-photo-input-tools';
import { RecordPromptAttachmentStrip } from '../shared/record-prompt-attachment-strip';

type RecordQuickInputCardProps = {
  promptRegistration: UseFormRegisterReturn;
  onApplyPrompt: () => void;
  onOpenManualInput: () => void;
  onPhotoRecord: () => void;
  isAnalyzing: boolean;
  attachments: PromptAttachment[];
  onAttachmentChange: (event: ChangeEvent<HTMLInputElement>) => boolean;
  onRemoveAttachment: (attachmentId: string) => void;
};

export function RecordQuickInputCard({
  promptRegistration,
  onApplyPrompt,
  onOpenManualInput,
  onPhotoRecord,
  isAnalyzing,
  attachments,
  onAttachmentChange,
  onRemoveAttachment,
}: RecordQuickInputCardProps): JSX.Element {
  return (
    <section className="record-screen__quick-card">
      <div className="record-screen__prompt-shell">
        <RecordPromptAttachmentStrip
          attachments={attachments}
          onRemoveAttachment={onRemoveAttachment}
        />

        <div className="record-screen__prompt-box">
          <textarea
            className="record-screen__prompt-input"
            placeholder="メッセージを入力"
            rows={4}
            style={{ height: '100px' }}
            {...promptRegistration}
          />
        </div>

        <div className="record-screen__prompt-toolbar">
          <div className="record-screen__prompt-tools">
            <RecordPhotoInputTools
              onAttachmentChange={onAttachmentChange}
              onPhotoRecord={onPhotoRecord}
            />

            <button
              className="record-screen__prompt-tool"
              onClick={onOpenManualInput}
              type="button"
            >
              <PenLine size={16} strokeWidth={2.1} />
              <span>手動入力</span>
            </button>
          </div>

          <button
            aria-label="入力内容を反映"
            className={isAnalyzing ? 'record-screen__prompt-submit record-screen__prompt-submit--loading' : 'record-screen__prompt-submit'}
            disabled={isAnalyzing}
            onClick={onApplyPrompt}
            type="button"
          >
            {isAnalyzing ? (
              <div className="loading-spinner loading-spinner--small" />
            ) : (
              <Send size={18} strokeWidth={2.1} />
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
