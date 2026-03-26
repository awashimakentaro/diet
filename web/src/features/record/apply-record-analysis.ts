/**
 * web/src/features/record/apply-record-analysis.ts
 *
 * 【責務】
 * AI 解析結果を Record フォームへ反映する。
 *
 * 【使用されるエージェント / 処理フロー】
 * - use-record-screen.ts から呼ばれる。
 * - 解析レスポンスの items と mealName をフォーム値へ変換する。
 *
 * 【やらないこと】
 * - API 通信
 * - UI 描画
 * - エラーハンドリング表示
 *
 * 【他ファイルとの関係】
 * - record-analysis-schema.ts と record-form-schema.ts の型を利用する。
 */

import type { UseFormReturn } from 'react-hook-form';

import type { RecordAnalysisResponse } from './record-analysis-schema';
import type { RecordFormValues } from './record-form-schema';

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

/**
 * 解析結果をフォームへ適用する。
 * 呼び出し元: use-record-screen。
 * @param params フォームと解析結果
 * @returns void
 * @remarks 副作用: RHF form state を更新する。
 */
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
