/* 【責務】
 * 保存成功後に Record 画面の下書きフォームを初期化する。
 */

import type { UseFormReturn } from 'react-hook-form';

import type { RecordFormValues } from '../schemas/record-form-schema';
import { createEmptyRecordItem } from '../utils/create-empty-record-item';
import { getTodayDateKey } from '../utils/get-today-date-key';

type ResetRecordDraftAfterSaveParams = {
    form: UseFormReturn<RecordFormValues>;//UseFormReturn は「RHF の form オブジェクトに入っている機能セットの型
    replaceItems: (items: RecordFormValues['items']) => void;
};

export function resetRecordDraftAfterSave({
    form,
    replaceItems,
}: ResetRecordDraftAfterSaveParams): void {
    form.setValue('prompt', '', { shouldDirty: false });
    form.setValue('recordedDate', getTodayDateKey(), { shouldDirty: false });//shouldDirty は「この setValue を変更済み扱いにするか」を決めるフラグ.react-hook-form の dirty は、初期値から変更されたかどうか の状態です。
    form.setValue('mealName', '', { shouldDirty: false });
    replaceItems([createEmptyRecordItem()]);
}