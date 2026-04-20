/* 【責務】
 * 食事編集のプロンプト添付画像一覧を描画する。
 */

import { X } from 'lucide-react';
import Image from 'next/image';
import type { JSX } from 'react';

import type { PromptAttachment } from '../hooks/use-prompt-attachments';

type MealPromptAttachmentStripProps = {
  attachments: PromptAttachment[];
  onRemoveAttachment: (attachmentId: string) => void;
};

export function MealPromptAttachmentStrip({
  attachments,
  onRemoveAttachment,
}: MealPromptAttachmentStripProps): JSX.Element | null {
  if (attachments.length === 0) {
    return null;
  }

  return (
    <div className="record-screen__attachment-strip">
      {attachments.map((attachment) => (
        <div className="record-screen__attachment-chip" key={attachment.id}>
          <Image
            alt={attachment.name}
            className="record-screen__attachment-image"
            height={80}
            src={attachment.previewUrl}
            unoptimized
            width={80}
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
