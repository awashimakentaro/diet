/* 【責務】
 * Record 画面のプロンプト入力欄で使う画像添付プレビュー状態を管理する。
 */

'use client';

import { useEffect, useState, type ChangeEvent } from 'react';

export type PromptAttachment = {
  id: string;
  name: string;
  previewUrl: string;
};

type UsePromptAttachmentsResult = {
  attachments: PromptAttachment[];
  handleAttachmentChange: (event: ChangeEvent<HTMLInputElement>) => boolean;
  handleRemoveAttachment: (attachmentId: string) => void;
  clearAttachments: () => void;
};

function buildAttachments(files: FileList): PromptAttachment[] {
  return Array.from(files).map((file, index) => ({
    id: `${file.name}-${file.size}-${file.lastModified}-${index}-${crypto.randomUUID()}`,
    name: file.name,
    previewUrl: URL.createObjectURL(file),
  }));
}

export function usePromptAttachments(): UsePromptAttachmentsResult {
  const [attachments, setAttachments] = useState<PromptAttachment[]>([]);

  function revokeAttachments(targets: PromptAttachment[]): void {
    targets.forEach((attachment) => {
      URL.revokeObjectURL(attachment.previewUrl);
    });
  }

  useEffect(() => {
    return () => {
      revokeAttachments(attachments);
    };
  }, [attachments]);

  function handleAttachmentChange(event: ChangeEvent<HTMLInputElement>): boolean {
    const { files } = event.target;

    if (!files || files.length === 0) {
      return false;
    }

    const nextAttachments = buildAttachments(files);
    setAttachments((current) => [...current, ...nextAttachments]);
    event.target.value = '';
    return true;
  }

  function handleRemoveAttachment(attachmentId: string): void {
    setAttachments((current) => {
      const target = current.find((attachment) => attachment.id === attachmentId);

      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }

      return current.filter((attachment) => attachment.id !== attachmentId);
    });
  }

  function clearAttachments(): void {
    revokeAttachments(attachments);
    setAttachments([]);
  }

  return {
    attachments,
    handleAttachmentChange,
    handleRemoveAttachment,
    clearAttachments,
  };
}
