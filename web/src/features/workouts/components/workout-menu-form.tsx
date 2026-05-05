/* 【責務】
 * 筋トレメニュー作成フォームを描画する。
 */

'use client';

import { Dumbbell, Plus, Save, Trash2 } from 'lucide-react';
import type { ChangeEvent, JSX } from 'react';

import type { WorkoutMenuFormValues } from '../types';

type WorkoutMenuFormProps = {
  values: WorkoutMenuFormValues;
  isSaving: boolean;
  onValueChange: (field: keyof WorkoutMenuFormValues, value: string) => void;
  onExerciseValueChange: (index: number, field: keyof WorkoutMenuFormValues['exercises'][number], value: string) => void;
  onAddExercise: () => void;
  onRemoveExercise: (index: number) => void;
  onSubmit: () => void;
};

export function WorkoutMenuForm({
  values,
  isSaving,
  onValueChange,
  onExerciseValueChange,
  onAddExercise,
  onRemoveExercise,
  onSubmit,
}: WorkoutMenuFormProps): JSX.Element {
  function createChangeHandler(field: keyof WorkoutMenuFormValues) {
    return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
      onValueChange(field, event.target.value);
    };
  }

  return (
    <section className="workouts-screen__card workouts-screen__form-card">
      <div className="workouts-screen__card-head">
        <p className="workouts-screen__eyebrow">Workout Menu</p>
        <h2 className="workouts-screen__section-title">筋トレメニュー作成</h2>
      </div>

      <div className="workouts-screen__form-grid">
        <label className="workouts-screen__field workouts-screen__field--wide">
          <span>メニュー名</span>
          <input onChange={createChangeHandler('name')} type="text" value={values.name} />
        </label>
      </div>

      <div className="workouts-screen__exercise-stack">
        {values.exercises.map((exercise, index) => (
          <div className="workouts-screen__exercise-card" key={`${index}-${values.exercises.length}`}>
            <div className="workouts-screen__exercise-head">
              <strong>種目 {index + 1}</strong>
              <button
                aria-label="種目を削除"
                disabled={values.exercises.length <= 1}
                onClick={() => onRemoveExercise(index)}
                type="button"
              >
                <Trash2 size={15} strokeWidth={2.2} />
              </button>
            </div>

            <div className="workouts-screen__form-grid">
              <label className="workouts-screen__field workouts-screen__field--wide">
                <span>種目名</span>
                <input
                  onChange={(event) => onExerciseValueChange(index, 'exerciseName', event.target.value)}
                  type="text"
                  value={exercise.exerciseName}
                />
              </label>
              <label className="workouts-screen__field">
                <span>セット数</span>
                <input
                  inputMode="numeric"
                  onChange={(event) => onExerciseValueChange(index, 'sets', event.target.value)}
                  type="text"
                  value={exercise.sets}
                />
              </label>
              <label className="workouts-screen__field">
                <span>回数</span>
                <input
                  inputMode="numeric"
                  onChange={(event) => onExerciseValueChange(index, 'reps', event.target.value)}
                  type="text"
                  value={exercise.reps}
                />
              </label>
              <label className="workouts-screen__field">
                <span>重量 kg</span>
                <input
                  inputMode="decimal"
                  onChange={(event) => onExerciseValueChange(index, 'weightKg', event.target.value)}
                  type="text"
                  value={exercise.weightKg}
                />
              </label>
            </div>
          </div>
        ))}
      </div>

      <button className="workouts-screen__secondary-button" onClick={onAddExercise} type="button">
        <Plus size={16} strokeWidth={2.2} />
        <span>種目を追加</span>
      </button>

      <label className="workouts-screen__field">
        <span>メモ</span>
        <textarea onChange={createChangeHandler('note')} rows={3} value={values.note} />
      </label>

      <button className="workouts-screen__primary-button" disabled={isSaving} onClick={onSubmit} type="button">
        {isSaving ? <span className="record-screen__loading-spinner record-screen__loading-spinner--inline" /> : <Save size={16} strokeWidth={2.2} />}
        <span>{isSaving ? '保存中...' : 'メニューを保存'}</span>
        <Dumbbell size={16} strokeWidth={2.2} />
      </button>
    </section>
  );
}
