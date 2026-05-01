/* 【責務】
 * 食事編集で共通利用する食品入力カードを描画する。
 */

'use client';

import { X } from 'lucide-react';
import type { JSX } from 'react';
import type { FieldValues, Path, UseFormRegister } from 'react-hook-form';

type MealEditorItemCardProps<FormValues extends FieldValues> = {
  index: number;
  register: UseFormRegister<FormValues>;
  canRemove: boolean;
  fieldIdPrefix: string;
  onRemove: (index: number) => void;
};

export function MealEditorItemCard<FormValues extends FieldValues>({
  index,
  register,
  canRemove,
  fieldIdPrefix,
  onRemove,
}: MealEditorItemCardProps<FormValues>): JSX.Element {
  return (
    <article className="record-screen__item-card">
      <div className="record-screen__item-header">
        <div className="record-screen__item-index">{index + 1}</div>
        <input
          className="record-screen__item-name"
          placeholder="食品名"
          type="text"
          {...register(`items.${index}.name` as Path<FormValues>)}
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
          <label htmlFor={`${fieldIdPrefix}-amount-${index}`}>分量</label>
          <input
            id={`${fieldIdPrefix}-amount-${index}`}
            placeholder="1人前"
            type="text"
            {...register(`items.${index}.amount` as Path<FormValues>)}
          />
        </div>
        <div className="record-screen__mini-field">
          <label htmlFor={`${fieldIdPrefix}-kcal-${index}`}>カロリー</label>
          <div className="record-screen__unit-field">
            <input
              id={`${fieldIdPrefix}-kcal-${index}`}
              placeholder="0"
              type="text"
              {...register(`items.${index}.kcal` as Path<FormValues>)}
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
              {...register(`items.${index}.protein` as Path<FormValues>)}
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
              {...register(`items.${index}.fat` as Path<FormValues>)}
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
              {...register(`items.${index}.carbs` as Path<FormValues>)}
            />
            <span>g</span>
          </div>
        </div>
      </div>
    </article>
  );
}
