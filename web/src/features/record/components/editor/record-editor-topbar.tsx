/* 【責務】
 * Record 編集パネルのヘッダーを描画する。
 */

import { X } from 'lucide-react';
import type { JSX } from 'react';

type RecordEditorTopbarProps = {
  mode: 'manual' | 'generated';
  onClose: () => void;
};

export function RecordEditorTopbar({
  mode,
  onClose,
}: RecordEditorTopbarProps): JSX.Element {
  const title = mode === 'generated' ? '解析結果を確認' : '食事内容を編集';
  const eyebrow = mode === 'generated' ? 'プロンプト結果' : '手動入力';

  return (
    <div className="record-screen__editor-topbar">
      <div>
        <p className="record-screen__field-label">{eyebrow}</p>
        <h2 className="record-screen__editor-title">{title}</h2>
      </div>

      <button
        aria-label="手動入力パネルを閉じる"
        className="record-screen__editor-close"
        onClick={onClose}
        type="button"
      >
        <X size={16} strokeWidth={2.4} />
      </button>
    </div>
  );
}
