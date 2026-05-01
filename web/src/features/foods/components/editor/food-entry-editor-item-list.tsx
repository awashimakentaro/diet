/* 【責務】
 * Foods の食品編集パネルで食品入力カード一覧を描画する。
 */

'use client';

import type { JSX } from 'react';
import type { FieldArrayWithId, UseFormReturn } from 'react-hook-form';

import type { MealFormValues } from '@/features/shared/meal-editor/schemas';
import { MealEditorItemList } from '@/features/shared/meal-editor/components';

type FoodEntryEditorItemListProps = {
  form: UseFormReturn<MealFormValues>;
  itemFields: FieldArrayWithId<MealFormValues, 'items', 'id'>[];
  onRemoveItem: (index: number) => void;
};

export function FoodEntryEditorItemList({
  form,
  itemFields,
  onRemoveItem,
}: FoodEntryEditorItemListProps): JSX.Element {
  return (
    <MealEditorItemList
      fieldIdPrefix="foods"
      itemFields={itemFields}
      mode="generated"
      onRemoveItem={onRemoveItem}
      register={form.register}
    />
  );
}
