/* 【責務】
 * Record 画面のプロンプト入力欄で使う画像添付プレビュー状態を管理する。
 */

'use client';

import { useEffect, useState, type ChangeEvent, type Dispatch, type SetStateAction } from 'react';

export type PromptAttachment = {
  id: string;
  name: string;
  previewUrl: string;
};

type UsePromptAttachmentsResult = {
  attachments: PromptAttachment[];
  handleAttachmentChange: (event: ChangeEvent<HTMLInputElement>) => boolean;//event: ChangeEvent<HTMLInputElement>はhandleChange に来るのは、input の変更イベントですよ　と宣言している
  handleRemoveAttachment: (attachmentId: string) => void;
  setAttachments: Dispatch<SetStateAction<PromptAttachment[]>>;//Dispatch<SetStateAction<boolean>> はsetStateはPromptAttachment[]を更新するための React の state 更新関数ですといういみ
};

function buildAttachments(files: FileList): PromptAttachment[] {
  return Array.from(files).map((file, index) => ({
    id: `${file.name}-${file.size}-${file.lastModified}-${index}`,
    name: file.name,
    previewUrl: URL.createObjectURL(file),
  }));
}

export function usePromptAttachments(): UsePromptAttachmentsResult {
  const [attachments, setAttachments] = useState<PromptAttachment[]>([]);

  useEffect(() => {
    return () => {
      attachments.forEach((attachment) => {
        URL.revokeObjectURL(attachment.previewUrl);
      });
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

  return {
    attachments,
    handleAttachmentChange,
    handleRemoveAttachment,
    setAttachments,
  };
}
