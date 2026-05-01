/* 【責務】
 * 食事編集で共通利用する食品入力カード一覧を描画する。
 */

'use client';

import type { JSX } from 'react';
import type { FieldValues, UseFormRegister } from 'react-hook-form';

import { MealEditorItemCard } from '../meal-editor-item-card';

type MealEditorItemListProps<FormValues extends FieldValues> = {
  mode: 'manual' | 'generated';
  fieldIdPrefix: string;
  itemFields: Array<{ id: string }>;
  register: UseFormRegister<FormValues>;
  onRemoveItem: (index: number) => void;
};

export function MealEditorItemList<FormValues extends FieldValues>({
  mode,
  fieldIdPrefix,
  itemFields,
  register,
  onRemoveItem,
}: MealEditorItemListProps<FormValues>): JSX.Element {
  const itemStackClassName = mode === 'generated'
    ? 'record-screen__item-stack record-screen__item-stack--generated'
    : 'record-screen__item-stack record-screen__item-stack--manual';

  return (
    <div className={itemStackClassName}>
      {itemFields.map((field, index) => (
        <MealEditorItemCard
          canRemove={itemFields.length > 1}
          fieldIdPrefix={fieldIdPrefix}
          index={index}
          key={field.id}
          onRemove={onRemoveItem}
          register={register}
        />
      ))}
    </div>
  );
}
