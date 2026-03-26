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
import { useId, type ChangeEvent, type JSX } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

import { usePromptAttachments } from '../use-prompt-attachments';

type RecordQuickInputCardProps = {
  promptRegistration: UseFormRegisterReturn;
  onApplyPrompt: () => void;
  onOpenManualInput: () => void;
  onPhotoRecord: () => void;
  isAnalyzing: boolean;
  promptGuideMessage: string | null;
};

export function RecordQuickInputCard({
  promptRegistration,
  onApplyPrompt,
  onOpenManualInput,
  onPhotoRecord,
  isAnalyzing,
  promptGuideMessage,
}: RecordQuickInputCardProps): JSX.Element {
  const fileInputId = useId();
  const cameraInputId = useId();
  const {
    attachments,
    handleAttachmentChange,
    handleRemoveAttachment,
  } = usePromptAttachments();

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>): void {
    const hasAttached = handleAttachmentChange(event);

    if (hasAttached) {
      onPhotoRecord();
    }
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
          {promptGuideMessage !== null ? (
            <div className="record-screen__prompt-guide">
              <p className="record-screen__prompt-guide-label">追加ガイド</p>
              <p className="record-screen__prompt-guide-copy">{promptGuideMessage}</p>
            </div>
          ) : null}

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

            <input
              accept="image/*"
              capture="environment"
              className="record-screen__photo-input"
              id={cameraInputId}
              onChange={handlePhotoChange}
              type="file"
            />

            <label className="record-screen__prompt-tool" htmlFor={fileInputId}>
              <ImagePlus size={16} strokeWidth={2.1} />
              <span>写真を追加</span>
            </label>

            <label className="record-screen__prompt-tool" htmlFor={cameraInputId}>
              <Camera size={16} strokeWidth={2.1} />
              <span>カメラ</span>
            </label>

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
            disabled={isAnalyzing}
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
