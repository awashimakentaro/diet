/* 【責務】
 * Foods の食品編集パネルで食品カード名入力欄を描画する。
 */

'use client';

import { Salad } from 'lucide-react';
import type { JSX } from 'react';
import type { UseFormReturn } from 'react-hook-form';

import type { MealFormValues } from '@/features/shared/meal-editor/schemas';

type FoodEntryNameFieldProps = {
  form: UseFormReturn<MealFormValues>;
};

export function FoodEntryNameField({
  form,
}: FoodEntryNameFieldProps): JSX.Element {
  return (
    <div className="record-screen__field-group">
      <label className="record-screen__field-label" htmlFor="food-entry-name">
        食品カード名
      </label>
      <div className="record-screen__name-field">
        <Salad className="record-screen__name-icon" size={18} strokeWidth={2.1} />
        <input
          className="record-screen__name-input"
          id="food-entry-name"
          placeholder="例: 高たんぱく朝食"
          type="text"
          {...form.register('mealName')}
        />
      </div>
    </div>
  );
}
