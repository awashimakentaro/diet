/**
 * web/src/features/record/use-prompt-attachments.ts
 *
 * 【責務】
 * Record 画面のプロンプト入力欄で使う画像添付プレビュー状態を管理する。
 *
 * 【使用されるエージェント / 処理フロー】
 * - web/src/app/app/record/_components/record-quick-input-card.tsx と record-item-add-panel.tsx から呼ばれる。
 * - file input の選択結果をプレビュー用 URL に変換して保持する。
 *
 * 【やらないこと】
 * - API 通信
 * - JSX 描画
 * - フォーム入力値の管理
 *
 * 【他ファイルとの関係】
 * - record の各 prompt UI コンポーネントから利用される。
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
  setAttachments: (attachments: PromptAttachment[]) => void;
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
