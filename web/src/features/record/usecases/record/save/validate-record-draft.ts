/* 【責務】
 * Record の保存前入力が有効か判定する。
 */

import type { RecordFormValues } from '../../../schemas/record-form-schema';

type ValidateRecordDraftResult =
  | { ok: true }
  | { ok: false; error: string };

export function validateRecordDraft(
  values: Pick<RecordFormValues, 'mealName' | 'items'>,
): ValidateRecordDraftResult {
  const hasAnyInput =
    values.mealName.trim().length > 0
    || values.items.some((item) => item.name.trim().length > 0);

  if (!hasAnyInput) {
    return { ok: false, error: '食事名または食品カードを入力してください。' };
  }

  return { ok: true };
}
