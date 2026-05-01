/* 【責務】
 * Record 編集パネルの食品内訳一覧を描画する。
 */

import type { JSX } from 'react';
import type { FieldArrayWithId, UseFormRegister } from 'react-hook-form';

import type { MealFormValues as RecordFormValues } from '@/features/shared/meal-editor/schemas';
import { MealEditorItemList } from '@/features/shared/meal-editor/components';

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
  return (
    <MealEditorItemList
      fieldIdPrefix="record"
      itemFields={itemFields}
      mode={mode}
      onRemoveItem={onRemoveItem}
      register={register}
    />
  );
}
