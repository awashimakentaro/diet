/* 【責務】
 * Foods 画面で食品ライブラリカード編集パネルを組み立てる。
 */

'use client';

import type { JSX } from 'react';
import type { FieldArrayWithId, UseFormReturn } from 'react-hook-form';

import type { MealFormValues } from '@/features/shared/meal-editor/schemas';

import { FoodEntryDraftSummary } from './food-entry-draft-summary';
import { FoodEntryEditorActions } from './food-entry-editor-actions';
import { FoodEntryEditorItemList } from './food-entry-editor-item-list';
import { FoodEntryEditorTopbar } from './food-entry-editor-topbar';
import { FoodEntryNameField } from './food-entry-name-field';

type FoodEntryEditorPanelProps = {
  form: UseFormReturn<MealFormValues>;
  itemFields: FieldArrayWithId<MealFormValues, 'items', 'id'>[];
  draftTotals: {
    kcal: number;
    protein: number;
    fat: number;
    carbs: number;
  };
  isSaving: boolean;
  feedbackMessage: string | null;
  feedbackTone: 'info' | 'error';
  onAddItem: () => void;
  onClose: () => void;
  onRemoveItem: (index: number) => void;
  onConfirm: () => void;
};

export function FoodEntryEditorPanel({
  form,
  itemFields,
  draftTotals,
  isSaving,
  feedbackMessage,
  feedbackTone,
  onAddItem,
  onClose,
  onRemoveItem,
  onConfirm,
}: FoodEntryEditorPanelProps): JSX.Element {
  return (
    <div className="foods-screen__editor-backdrop">
      <section className="foods-screen__editor-panel">
        <FoodEntryEditorTopbar onClose={onClose} />

        <div className="record-screen__editor-body">
          <FoodEntryNameField form={form} />

          <div className="record-screen__field-group">
            <label className="record-screen__field-label">内訳の詳細</label>
            <FoodEntryDraftSummary draftTotals={draftTotals} />
            <FoodEntryEditorItemList
              form={form}
              itemFields={itemFields}
              onRemoveItem={onRemoveItem}
            />
            <FoodEntryEditorActions
              feedbackMessage={feedbackMessage}
              feedbackTone={feedbackTone}
              isSaving={isSaving}
              onAddItem={onAddItem}
              onConfirm={onConfirm}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
