'use client';

/**
 * web/src/features/record/components/record-quick-input-card.tsx
 *
 * 【責務】
 * Record 画面のクイック入力カードを描画する。
 *
 * 【使用されるエージェント / 処理フロー】
 * - record-screen.tsx から呼ばれる。
 * - RHF の register 結果とローカルハンドラを受け取る。
 * - プロンプト入力欄内の画像添付プレビューをローカル state で管理する。
 *
 * 【やらないこと】
 * - 永続化
 * - API 通信
 * - 下書き編集詳細の管理
 *
 * 【他ファイルとの関係】
 * - use-record-screen.ts の prompt とハンドラに依存する。
 */

import { Camera, ImagePlus, PenLine, Send, X } from 'lucide-react';
import {
  useEffect,
  useId,
  useState,
  type ChangeEvent,
  type JSX,
} from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

type RecordQuickInputCardProps = {
  promptRegistration: UseFormRegisterReturn;
  onApplyPrompt: () => void;
  onOpenManualInput: () => void;
  onPhotoRecord: () => void;
};

type PromptAttachment = {
  id: string;
  name: string;
  previewUrl: string;
};

export function RecordQuickInputCard({
  promptRegistration,
  onApplyPrompt,
  onOpenManualInput,
  onPhotoRecord,
}: RecordQuickInputCardProps): JSX.Element {
  const fileInputId = useId();
  const [attachments, setAttachments] = useState<PromptAttachment[]>([]);

  useEffect(() => {
    return () => {
      attachments.forEach((attachment) => {
        URL.revokeObjectURL(attachment.previewUrl);
      });
    };
  }, [attachments]);

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>): void {
    const { files } = event.target;

    if (!files || files.length === 0) {
      return;
    }

    const nextAttachments = Array.from(files).map((file, index) => ({
      id: `${file.name}-${file.size}-${index}`,
      name: file.name,
      previewUrl: URL.createObjectURL(file),
    }));

    setAttachments((current) => [...current, ...nextAttachments]);
    event.target.value = '';
    onPhotoRecord();
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

  return (
    <section className="record-screen__quick-card">
      <div className="record-screen__prompt-shell">
        {attachments.length > 0 ? (
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
                  onClick={() => handleRemoveAttachment(attachment.id)}
                  type="button"
                >
                  <X size={12} strokeWidth={2.4} />
                </button>
              </div>
            ))}
          </div>
        ) : null}

        <div className="record-screen__prompt-box">
          <textarea
            className="record-screen__prompt-input"
            placeholder="メッセージを入力"
            {...promptRegistration}
          />
        </div>

        <div className="record-screen__prompt-toolbar">
          <div className="record-screen__prompt-tools">
            <input
              accept="image/*"
              className="record-screen__photo-input"
              id={fileInputId}
              multiple
              onChange={handlePhotoChange}
              type="file"
            />

            <label className="record-screen__prompt-tool" htmlFor={fileInputId}>
              <ImagePlus size={16} strokeWidth={2.1} />
              <span>写真を追加</span>
            </label>

            <button
              className="record-screen__prompt-tool"
              onClick={onPhotoRecord}
              type="button"
            >
              <Camera size={16} strokeWidth={2.1} />
              <span>カメラ</span>
            </button>

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
            className="record-screen__prompt-submit"
            onClick={onApplyPrompt}
            type="button"
          >
            <Send size={18} strokeWidth={2.1} />
          </button>
        </div>
      </div>
    </section>
  );
}
