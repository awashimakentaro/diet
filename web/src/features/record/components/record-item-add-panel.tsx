/**
 * web/src/features/record/components/record-item-add-panel.tsx
 *
 * 【責務】
 * Record 編集カード内で食品追加方法の選択と追加用プロンプト入力を描画する。
 *
 * 【使用されるエージェント / 処理フロー】
 * - record-editor-panel.tsx から呼ばれる。
 * - 手動追加またはプロンプト追加の導線を表示する。
 *
 * 【やらないこと】
 * - API 通信
 * - フォーム全体の state 管理
 * - 画面遷移
 *
 * 【他ファイルとの関係】
 * - use-record-screen.ts のハンドラと prompt register を受け取る。
 * - web/src/styles/globals.css の record-screen__add-panel-* 系クラスに依存する。
 */

'use client';

import { ArrowLeft, Camera, ImagePlus, PenLine, Plus, Sparkles, X } from 'lucide-react';
import { useId, useState, type ChangeEvent, type JSX } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

import { type PromptAttachment } from '../use-prompt-attachments';

type AddPanelMode = 'closed' | 'chooser' | 'prompt';

type RecordItemAddPanelProps = {
  promptRegistration: UseFormRegisterReturn;
  isAnalyzing: boolean;
  onAddManualItem: () => void;
  onApplyPrompt: () => void | Promise<void>;
  onPhotoRecord: () => void;
  attachments: PromptAttachment[];
  onAttachmentChange: (event: ChangeEvent<HTMLInputElement>) => boolean;
  onRemoveAttachment: (attachmentId: string) => void;
};

export function RecordItemAddPanel({
  promptRegistration,
  isAnalyzing,
  onAddManualItem,
  onApplyPrompt,
  onPhotoRecord,
  attachments,
  onAttachmentChange,
  onRemoveAttachment,
}: RecordItemAddPanelProps): JSX.Element {
  const fileInputId = useId();
  const cameraInputId = useId();
  const [mode, setMode] = useState<AddPanelMode>('closed');


  function handleAddManualItem(): void {
    onAddManualItem();
    setMode('closed');
  }

  async function handleApplyPrompt(): Promise<void> {
    await onApplyPrompt();
    setMode('closed');
  }

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>): void {
    const hasAttached = onAttachmentChange(event);

    if (hasAttached) {
      onPhotoRecord();
    }
  }


  if (mode === 'closed') {
    return (
      <button
        className="record-screen__add-button"
        onClick={() => setMode('chooser')}
        type="button"
      >
        <Plus size={18} strokeWidth={2.4} />
        <span>食品を追加する</span>
      </button>
    );
  }

  if (mode === 'chooser') {
    return (
      <section className="record-screen__add-panel">
        <div className="record-screen__add-panel-head">
          <div>
            <p className="record-screen__field-label">食品を追加</p>
            <h3 className="record-screen__add-panel-title">食品の追加方法を選択</h3>
          </div>

          <button
            aria-label="食品追加パネルを閉じる"
            className="record-screen__add-panel-close"
            onClick={() => setMode('closed')}
            type="button"
          >
            <X size={16} strokeWidth={2.2} />
          </button>
        </div>

        <div className="record-screen__add-panel-actions">
          <button
            className="record-screen__add-option"
            onClick={handleAddManualItem}
            type="button"
          >
            <PenLine size={16} strokeWidth={2.2} />
            <div>
              <strong>手動で追加</strong>
              <span>空の食品行を1つ追加して数値を直接入力します。</span>
            </div>
          </button>

          <button
            className="record-screen__add-option"
            onClick={() => setMode('prompt')}
            type="button"
          >
            <Sparkles size={16} strokeWidth={2.2} />
            <div>
              <strong>プロンプトで追加</strong>
              <span>食材名や料理名を入力して、推定カードを現在の内容へ追加します。</span>
            </div>
          </button>
        </div>
      </section>
    );
  }

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
          onClick={() => setMode('chooser')}
          type="button"
        >
          <X size={16} strokeWidth={2.2} />
        </button>
      </div>

      <p className="record-screen__add-panel-copy">
        例: 「納豆1パックとごはん100gを追加」「みそ汁を1杯分追加」
      </p>

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
                onClick={() => onRemoveAttachment(attachment.id)}
                type="button"
              >
                <X size={12} strokeWidth={2.4} />
              </button>

            </div>
          ))}
        </div>
      ) : null}

      <textarea
        className="record-screen__add-prompt-input"
        placeholder="追加したい食品や料理を入力"
        {...promptRegistration}
      />

      <div className="record-screen__add-panel-tools">
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
      </div>

      <div className="record-screen__add-panel-footer">
        <button
          className="record-screen__add-panel-back"
          onClick={() => setMode('chooser')}
          type="button"
        >
          <ArrowLeft size={16} strokeWidth={2.1} />
          <span>追加方法を戻す</span>
        </button>

        <button
          className="record-screen__add-panel-submit"
          disabled={isAnalyzing}
          onClick={() => {
            void handleApplyPrompt();
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
