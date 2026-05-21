/* 【責務】
 * 筋トレ以外の単発ワークアウト記録フォームを描画する。
 */

'use client';

import { Bike } from 'lucide-react';
import type { ChangeEvent, JSX } from 'react';

import type { OtherWorkoutFormValues } from '../types';

type OtherWorkoutLogFormProps = {
  values: OtherWorkoutFormValues;
  isSaving: boolean;
  onValueChange: (field: keyof OtherWorkoutFormValues, value: string) => void;
  onAddToday: () => void;
};

export function OtherWorkoutLogForm({
  values,
  isSaving,
  onValueChange,
  onAddToday,
}: OtherWorkoutLogFormProps): JSX.Element {
  function createChangeHandler(field: keyof OtherWorkoutFormValues) {
    return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
      onValueChange(field, event.target.value);
    };
  }

  return (
    <section className="workouts-screen__card workouts-screen__other-card">
      <div className="workouts-screen__card-head">
        <p className="workouts-screen__eyebrow">Other Workout</p>
        <h2 className="workouts-screen__section-title">その他ワークアウト</h2>
        <span className="workouts-screen__section-copy">
          AI推定を使わず、自分で時間と消費カロリーを入力して今日の記録に追加します。散歩や自転車など、筋トレ以外の運動に使えます。
        </span>
      </div>

      <div className="workouts-screen__form-grid">
        <label className="workouts-screen__field workouts-screen__field--wide">
          <span>ワークアウト名</span>
          <input onChange={createChangeHandler('name')} placeholder="自転車 / 散歩 / ランニング" type="text" value={values.name} />
        </label>
        <label className="workouts-screen__field">
          <span>時間 分</span>
          <input inputMode="numeric" onChange={createChangeHandler('durationMinutes')} type="text" value={values.durationMinutes} />
        </label>
        <label className="workouts-screen__field">
          <span>消費 kcal</span>
          <input inputMode="numeric" onChange={createChangeHandler('burnedKcal')} type="text" value={values.burnedKcal} />
        </label>
      </div>

      <label className="workouts-screen__field">
        <span>メモ</span>
        <textarea onChange={createChangeHandler('note')} rows={2} value={values.note} />
      </label>

      <button className="workouts-screen__primary-button" disabled={isSaving} onClick={onAddToday} type="button">
        {isSaving ? <span className="record-screen__loading-spinner record-screen__loading-spinner--inline" /> : <Bike size={16} strokeWidth={2.2} />}
        <span>{isSaving ? '保存中...' : '今日の記録に追加'}</span>
      </button>
    </section>
  );
}
