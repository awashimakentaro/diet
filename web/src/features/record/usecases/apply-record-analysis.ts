/* 【責務】
 * AI 解析結果を Record フォームへ反映する。
 */

import type { UseFormReturn } from 'react-hook-form';

import type { RecordAnalysisResponse } from '../schemas/record-analysis-schema';
import type { RecordFormValues } from '../schemas/record-form-schema';

type ApplyRecordAnalysisParams = {
  form: UseFormReturn<RecordFormValues>;
  replaceItems: (items: RecordFormValues['items']) => void;
  currentItems: RecordFormValues['items'];
  draft: RecordAnalysisResponse;
  mode: 'replace' | 'append';
};

function toStringValue(value: number): string {
  return String(Math.round(value * 10) / 10);
}

export function applyRecordAnalysisToForm({
  form,
  replaceItems,
  currentItems,
  draft,
  mode,
}: ApplyRecordAnalysisParams): void {
  const nextItems = draft.items.map((item) => ({
    name: item.name,
    amount: item.amount,
    kcal: toStringValue(item.kcal),
    protein: toStringValue(item.protein),
    fat: toStringValue(item.fat),
    carbs: toStringValue(item.carbs),
  }));

  if (mode === 'replace') {
    form.setValue('mealName', draft.menuName, { shouldDirty: true });
    form.setValue('prompt', '', { shouldDirty: true });
    replaceItems(nextItems);
    return;
  }

  if (form.getValues('mealName').trim().length === 0) {
    form.setValue('mealName', draft.menuName, { shouldDirty: true });
  }

  form.setValue('prompt', '', { shouldDirty: true });
  replaceItems([...currentItems, ...nextItems]);
}
