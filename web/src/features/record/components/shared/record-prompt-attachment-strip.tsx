/* 【責務】
 * Record 画面のプロンプト添付画像一覧を描画する。
 */

import { X } from 'lucide-react';
import type { JSX } from 'react';

import type { PromptAttachment } from '../../hooks/use-prompt-attachments';

type RecordPromptAttachmentStripProps = {
  attachments: PromptAttachment[];
  onRemoveAttachment: (attachmentId: string) => void;
};

export function RecordPromptAttachmentStrip({
  attachments,
  onRemoveAttachment,
}: RecordPromptAttachmentStripProps): JSX.Element | null {
  if (attachments.length === 0) {
    return null;
  }

  return (
    <div className="record-screen__attachment-strip">
      {attachments.map((attachment) => (
        <div className="record-screen__attachment-chip" key={attachment.id}>
          <img
            alt={attachment.name}
            className="record-screen__attachment-image"
            src={attachment.previewUrl}
          />
          <button
            aria-label={`${attachment.name} を削除`}
            className="record-screen__attachment-remove"
            onClick={() => onRemoveAttachment(attachment.id)}
            type="button"
          >
            <X size={12} strokeWidth={2.4} />
          </button>
        </div>
      ))}
    </div>
  );
}
