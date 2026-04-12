/* 【責務】
 * Record の添付画像を解析 API 用の base64 配列へ変換する。
 */

import { fileToBase64 } from '@/utils/file-to-base64';

import type { PromptAttachment } from '../../hooks/use-prompt-attachments';

export async function convertRecordAttachmentsToBase64(
  attachments: PromptAttachment[],
): Promise<string[]> {
  return Promise.all(
    attachments.map(async (attachment) => {
      const response = await fetch(attachment.previewUrl);
      const blob = await response.blob();
      return fileToBase64(blob);
    }),
  );
}
