/* 【責務】
 * Record 編集カードのプロンプト追加フォームを描画する。
 */

'use client';

import { ArrowLeft, Sparkles, X } from 'lucide-react';
import type { ChangeEvent, JSX } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

import type { PromptAttachment } from '../../hooks/use-prompt-attachments';
import { RecordPhotoInputTools } from '../shared/record-photo-input-tools';
import { RecordPromptAttachmentStrip } from '../shared/record-prompt-attachment-strip';

type RecordItemAddPromptPanelProps = {
  promptRegistration: UseFormRegisterReturn;
  isAnalyzing: boolean;
  onApplyPrompt: () => void | Promise<void>;
  onBack: () => void;
  onAttachmentChange: (event: ChangeEvent<HTMLInputElement>) => boolean;
  onPhotoRecord: () => void;
  attachments: PromptAttachment[];
  onRemoveAttachment: (attachmentId: string) => void;
};

export function RecordItemAddPromptPanel({
  promptRegistration,
  isAnalyzing,
  onApplyPrompt,
  onBack,
  onAttachmentChange,
  onPhotoRecord,
  attachments,
  onRemoveAttachment,
}: RecordItemAddPromptPanelProps): JSX.Element {
  return (
    <section className="record-screen__add-panel record-screen__add-panel--prompt">
      <div className="record-screen__add-panel-head">
        <div>
          <p className="record-screen__field-label">プロンプト追加</p>
          <h3 className="record-screen__add-panel-title">プロンプトから食品を追加</h3>
        </div>

        <button
          aria-label="プロンプト追加パネルを閉じる"
          className="record-screen__add-panel-close"
          onClick={onBack}
          type="button"
        >
          <X size={16} strokeWidth={2.2} />
        </button>
      </div>

      <p className="record-screen__add-panel-copy">
        例: 「納豆1パックとごはん100gを追加」「みそ汁を1杯分追加」
      </p>

      <RecordPromptAttachmentStrip
        attachments={attachments}
        onRemoveAttachment={onRemoveAttachment}
      />

      <textarea
        className="record-screen__add-prompt-input"
        placeholder="追加したい食品や料理を入力"
        {...promptRegistration}
      />

      <div className="record-screen__add-panel-tools">
        <RecordPhotoInputTools
          onAttachmentChange={onAttachmentChange}
          onPhotoRecord={onPhotoRecord}
        />
      </div>

      <div className="record-screen__add-panel-footer">
        <button
          className="record-screen__add-panel-back"
          onClick={onBack}
          type="button"
        >
          <ArrowLeft size={16} strokeWidth={2.1} />
          <span>追加方法を戻す</span>
        </button>

        <button
          className="record-screen__add-panel-submit"
          disabled={isAnalyzing}
          onClick={() => {
            void onApplyPrompt();
          }}
          type="button"
        >
          <Sparkles size={16} strokeWidth={2.1} />
          <span>{isAnalyzing ? '追加中...' : 'この内容を追加する'}</span>
        </button>
      </div>

      {isAnalyzing ? (
        <div
          aria-busy="true"
          aria-live="polite"
          className="record-screen__add-panel-loading"
        >
          <div className="record-screen__loading-spinner record-screen__loading-spinner--inline" />
          <p>既存の食品カードを保ったまま、追加候補を解析しています。</p>
        </div>
      ) : null}
    </section>
  );
}
