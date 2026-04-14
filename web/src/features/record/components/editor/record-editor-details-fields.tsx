/* 【責務】
 * Record 編集パネルの食事基本情報入力欄を描画する。
 */

import { Salad } from 'lucide-react';
import type { JSX } from 'react';
import type { UseFormReturn } from 'react-hook-form';

import type { RecordFormValues } from '../../schemas/record-form-schema';

type RecordEditorDetailsFieldsProps = {
  form: UseFormReturn<RecordFormValues>;
};

export function RecordEditorDetailsFields({
  form,
}: RecordEditorDetailsFieldsProps): JSX.Element {
  return (
    <>
      <div className="record-screen__field-group">
        <label className="record-screen__field-label" htmlFor="meal-name">
          食事の名称
        </label>
        <div className="record-screen__name-field">
          <Salad className="record-screen__name-icon" size={18} strokeWidth={2.1} />
          <input
            className="record-screen__name-input"
            id="meal-name"
            placeholder="例: パワーランチ"
            type="text"
            {...form.register('mealName')}
          />
        </div>
      </div>

      <div className="record-screen__field-group">
        <label className="record-screen__field-label" htmlFor="recorded-date">
          記録する日付
        </label>
        <input
          className="record-screen__date-input"
          id="recorded-date"
          type="date"
          {...form.register('recordedDate')}
        />
      </div>
    </>
  );
}
