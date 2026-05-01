/* 【責務】
 * Foods の食品編集パネルで追加・保存操作を描画する。
 */

'use client';

import { CheckCircle2 } from 'lucide-react';
import type { JSX } from 'react';

type FoodEntryEditorActionsProps = {
  isSaving: boolean;
  feedbackMessage: string | null;
  feedbackTone: 'info' | 'error';
  onAddItem: () => void;
  onConfirm: () => void;
};

export function FoodEntryEditorActions({
  isSaving,
  feedbackMessage,
  feedbackTone,
  onAddItem,
  onConfirm,
}: FoodEntryEditorActionsProps): JSX.Element {
  return (
    <>
      <button
        className="record-screen__add-button"
        onClick={onAddItem}
        type="button"
      >
        <span>食品を追加する</span>
      </button>

      {feedbackMessage !== null ? (
        <p
          className={
            feedbackTone === 'error'
              ? 'record-screen__feedback record-screen__feedback--error'
              : 'record-screen__feedback'
          }
        >
          {feedbackMessage}
        </p>
      ) : null}

      <button
        className={isSaving ? 'record-screen__confirm-button record-screen__confirm-button--loading' : 'record-screen__confirm-button'}
        disabled={isSaving}
        onClick={onConfirm}
        type="button"
      >
        {isSaving ? (
          <>
            <span className="record-screen__loading-spinner record-screen__loading-spinner--inline" />
            <span>保存中です...</span>
          </>
        ) : (
          <>
            <CheckCircle2 size={18} strokeWidth={2.4} />
            <span>この内容で保存する</span>
          </>
        )}
      </button>
    </>
  );
}
