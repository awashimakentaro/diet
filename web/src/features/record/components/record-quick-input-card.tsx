/**
 * web/src/features/record/components/record-quick-input-card.tsx
 *
 * 【責務】
 * Record 画面のクイック入力カードを描画する。
 *
 * 【使用されるエージェント / 処理フロー】
 * - record-screen.tsx から呼ばれる。
 * - RHF の register 結果とローカルハンドラを受け取る。
 *
 * 【やらないこと】
 * - 永続化
 * - API 通信
 * - 下書き編集詳細の管理
 *
 * 【他ファイルとの関係】
 * - use-record-screen.ts の prompt とハンドラに依存する。
 */

import { Camera, Send } from 'lucide-react';
import type { JSX } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

type RecordQuickInputCardProps = {
  promptRegistration: UseFormRegisterReturn;
  onApplyPrompt: () => void;
  onPhotoRecord: () => void;
};

export function RecordQuickInputCard({
  promptRegistration,
  onApplyPrompt,
  onPhotoRecord,
}: RecordQuickInputCardProps): JSX.Element {
  return (
    <section className="record-screen__quick-card">
      <div className="record-screen__prompt-box">
        <textarea
          className="record-screen__prompt-input"
          placeholder="何を食べましたか？ (例: 納豆ご飯とプロテイン)"
          {...promptRegistration}
        />
        <button
          aria-label="入力内容を反映"
          className="record-screen__prompt-submit"
          onClick={onApplyPrompt}
          type="button"
        >
          <Send size={18} strokeWidth={2.1} />
        </button>
      </div>

      <button
        className="record-screen__photo-button"
        onClick={onPhotoRecord}
        type="button"
      >
        <Camera size={18} strokeWidth={2.3} />
        <span>食事を写真で記録する</span>
      </button>
    </section>
  );
}
