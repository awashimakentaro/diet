/* 【責務】
 * Record 編集カードの食品追加方法選択パネルを描画する。
 */

import { PenLine, Sparkles, X } from 'lucide-react';
import type { JSX } from 'react';

type RecordItemAddMethodPanelProps = {
  onAddManualItem: () => void;
  onClose: () => void;
  onOpenPrompt: () => void;
};

export function RecordItemAddMethodPanel({
  onAddManualItem,
  onClose,
  onOpenPrompt,
}: RecordItemAddMethodPanelProps): JSX.Element {
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
          onClick={onClose}
          type="button"
        >
          <X size={16} strokeWidth={2.2} />
        </button>
      </div>

      <div className="record-screen__add-panel-actions">
        <button
          className="record-screen__add-option"
          onClick={onAddManualItem}
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
          onClick={onOpenPrompt}
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
