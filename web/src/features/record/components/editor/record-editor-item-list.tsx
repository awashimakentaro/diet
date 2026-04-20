/* 【責務】
 * Record 編集パネルの食品内訳一覧を描画する。
 */

import type { JSX } from 'react';
import type { FieldArrayWithId, UseFormRegister } from 'react-hook-form';

import type { MealFormValues as RecordFormValues } from '@/features/shared/meal-editor/schemas';
import { RecordEditorItemCard } from './record-editor-item-card';

type RecordEditorItemListProps = {
  mode: 'manual' | 'generated';
  itemFields: FieldArrayWithId<RecordFormValues, 'items', 'id'>[];
  register: UseFormRegister<RecordFormValues>;
  onRemoveItem: (index: number) => void;
};

export function RecordEditorItemList({
  mode,
  itemFields,
  register,
  onRemoveItem,
}: RecordEditorItemListProps): JSX.Element {
  const itemStackClassName = mode === 'generated'
    ? 'record-screen__item-stack record-screen__item-stack--generated'
    : 'record-screen__item-stack record-screen__item-stack--manual';

  return (
    <div className={itemStackClassName}>
      {itemFields.map((field, index) => (
        <RecordEditorItemCard
          key={field.id}
          canRemove={itemFields.length > 1}
          index={index}
          onRemove={onRemoveItem}
          register={register}
        />
      ))}
    </div>
  );
}
