/* 【責務】
 * AI 解析結果を Record フォームへ反映する。
 */

import type { UseFormReturn } from 'react-hook-form';

import type { RecordAnalysisResponse } from '../../../schemas/record-analysis-schema';
import type { RecordFormValues } from '../../../schemas/record-form-schema';

type ApplyRecordAnalysisParams = {
  form: UseFormReturn<RecordFormValues>;
  replaceItems: (items: RecordFormValues['items']) => void;
  currentItems: RecordFormValues['items'];
  draft: RecordAnalysisResponse;
  mode: 'replace' | 'append';
};

function toStringValue(value: number): string {//カロリーなどの数値を文字列に変換する
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
    form.setValue('mealName', draft.menuName, { shouldDirty: true });//formのmealNameにdraft.menuNameを代入する処理 { shouldDirty: true }はユーザーが編集したのと同じように、変更済みとして扱う」指定.これを付けると、保存ボタンの活性制御や「未保存の変更あり」の判定に反映できます。
    form.setValue('prompt', '', { shouldDirty: true });//formのpromptに空文字を代入する処理
    replaceItems(nextItems);//formのitemsにnextItemsを代入する処理
    return;
  }

  if (form.getValues('mealName').trim().length === 0) {
    form.setValue('mealName', draft.menuName, { shouldDirty: true });
  }

  form.setValue('prompt', '', { shouldDirty: true });
  replaceItems([...currentItems, ...nextItems]);
}
