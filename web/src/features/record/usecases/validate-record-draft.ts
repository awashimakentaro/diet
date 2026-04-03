import { RecordFormValues } from "../schemas/record-form-schema";

type ValidateRecordDraftResult =
    | { ok: true, }
    | { ok: false, error: string }
//これはunion型といい成功時失敗時に返すオブジェクトを変えるという意味|とはまたは、といういみ


export function validateRecordDraft(values: Pick<RecordFormValues, 'mealName'|'items'>): ValidateRecordDraftResult {
    const hasAnyInput = values.mealName.trim().length > 0 || values.items.some((item) => item.name.trim().length > 0);
    if (!hasAnyInput) {
        return { ok: false, error: '食事名または食品カードを入力してください。' };
    }
    return { ok: true };
}
