/* 【責務】
 * Foods の食品編集パネル上部バーを描画する。
 */

'use client';

import { X } from 'lucide-react';
import type { JSX } from 'react';

type FoodEntryEditorTopbarProps = {
  onClose: () => void;
};

export function FoodEntryEditorTopbar({
  onClose,
}: FoodEntryEditorTopbarProps): JSX.Element {
  return (
    <div className="record-screen__editor-topbar">
      <div>
        <p className="record-screen__field-label">foods editor</p>
        <h2 className="record-screen__editor-title">食品カードを編集</h2>
      </div>

      <button
        aria-label="食品編集パネルを閉じる"
        className="record-screen__editor-close"
        onClick={onClose}
        type="button"
      >
        <X size={16} strokeWidth={2.4} />
      </button>
    </div>
  );
}
