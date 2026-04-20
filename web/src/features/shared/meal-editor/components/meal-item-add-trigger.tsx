/* 【責務】
 * 食事編集の食品追加トリガーを描画する。
 */

import { Plus } from 'lucide-react';
import type { JSX } from 'react';

type MealItemAddTriggerProps = {
  onOpen: () => void;
};

export function MealItemAddTrigger({
  onOpen,
}: MealItemAddTriggerProps): JSX.Element {
  return (
    <button
      className="record-screen__add-button"
      onClick={onOpen}
      type="button"
    >
      <Plus size={18} strokeWidth={2.4} />
      <span>食品を追加する</span>
    </button>
  );
}
