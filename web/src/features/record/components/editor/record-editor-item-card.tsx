/* 【責務】
 * Record 記録タブにてプロンプト入力後の編集パネルの中の、食品カード1件分を描画する。　
 */

import { X } from 'lucide-react';
import type { JSX } from 'react';
import type { UseFormRegister } from 'react-hook-form';

import type { MealFormValues as RecordFormValues } from '@/features/shared/meal-editor/schemas';

type RecordEditorItemCardProps = {
  index: number;
  register: UseFormRegister<RecordFormValues>;
  canRemove: boolean;
  onRemove: (index: number) => void;
};

export function RecordEditorItemCard({
  index,
  register,
  canRemove,
  onRemove,
}: RecordEditorItemCardProps): JSX.Element {
  return (
    <article className="record-screen__item-card">
      <div className="record-screen__item-header">
        <div className="record-screen__item-index">{index + 1}</div>
        <input
          className="record-screen__item-name"
          placeholder="食品名"
          type="text"
          {...register(`items.${index}.name`)}
        />
        {canRemove ? (
          <button
            aria-label={`食品 ${index + 1} を削除`}
            className="record-screen__remove-button"
            onClick={() => onRemove(index)}
            type="button"
          >
            <X size={16} strokeWidth={2.4} />
          </button>
        ) : null}
      </div>

      <div className="record-screen__split-fields">
        <div className="record-screen__mini-field">
          <label htmlFor={`amount-${index}`}>分量</label>
          <input
            id={`amount-${index}`}
            placeholder="1人前"
            type="text"
            {...register(`items.${index}.amount`)}
          />
        </div>
        <div className="record-screen__mini-field">
          <label htmlFor={`kcal-${index}`}>カロリー</label>
          <div className="record-screen__unit-field">
            <input
              id={`kcal-${index}`}
              placeholder="0"
              type="text"
              {...register(`items.${index}.kcal`)}
            />
            <span>kcal</span>
          </div>
        </div>
      </div>

      <div className="record-screen__macro-edit-grid">
        <div className="record-screen__macro-edit">
          <p className="record-screen__macro-chip record-screen__macro-chip--protein">P</p>
          <div className="record-screen__macro-input">
            <input
              placeholder="0"
              type="text"
              {...register(`items.${index}.protein`)}
            />
            <span>g</span>
          </div>
        </div>
        <div className="record-screen__macro-edit">
          <p className="record-screen__macro-chip record-screen__macro-chip--fat">F</p>
          <div className="record-screen__macro-input">
            <input
              placeholder="0"
              type="text"
              {...register(`items.${index}.fat`)}
            />
            <span>g</span>
          </div>
        </div>
        <div className="record-screen__macro-edit">
          <p className="record-screen__macro-chip record-screen__macro-chip--carbs">C</p>
          <div className="record-screen__macro-input">
            <input
              placeholder="0"
              type="text"
              {...register(`items.${index}.carbs`)}
            />
            <span>g</span>
          </div>
        </div>
      </div>
    </article>
  );
}
