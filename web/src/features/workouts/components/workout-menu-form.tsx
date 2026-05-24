/* 【責務】
 * 筋トレメニュー作成フォームを描画する。
 */

'use client';

import { Ban, Dumbbell, Plus, Sparkles, Trash2 } from 'lucide-react';
import { useRef, type ChangeEvent, type JSX } from 'react';

import type { WorkoutMenuFormValues } from '../types';

type WorkoutMenuFormProps = {
  values: WorkoutMenuFormValues;
  isSaving: boolean;
  aiLimit: {
    isLoading: boolean;
    used: number;
    limit: number;
    isUnlimited: boolean;
    isReached: boolean;
  };
  onValueChange: (field: keyof WorkoutMenuFormValues, value: string) => void;
  onExerciseValueChange: (index: number, field: keyof WorkoutMenuFormValues['exercises'][number], value: string) => void;
  onAddExercise: () => void;
  onRemoveExercise: (index: number) => void;
  onLogToday: () => void;
};

export function WorkoutMenuForm({
  values,
  isSaving,
  aiLimit,
  onValueChange,
  onExerciseValueChange,
  onAddExercise,
  onRemoveExercise,
  onLogToday,
}: WorkoutMenuFormProps): JSX.Element {
  const sectionRef = useRef<HTMLElement | null>(null);

  function createChangeHandler(field: keyof WorkoutMenuFormValues) {
    return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
      onValueChange(field, event.target.value);
    };
  }

  function handleLogToday(): void {
    window.requestAnimationFrame(() => {
      sectionRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    });
    onLogToday();
  }

  return (
    <section
      className="workouts-screen__card workouts-screen__form-card"
      ref={sectionRef}
    >
      <div className="workouts-screen__card-head">
        <p className="workouts-screen__eyebrow">Workout Menu</p>
        <h2 className="workouts-screen__section-title">筋トレメニュー作成</h2>
        <span className="workouts-screen__section-copy">
          体重、セット数、回数、重量をもとにAIが消費カロリーを推定し、そのまま今日の記録に追加します。
        </span>
      </div>

      {aiLimit.isReached ? (
        <section className="workouts-screen__ai-limit-card" aria-live="polite">
          <Ban size={22} strokeWidth={2.2} />
          <div>
            <p className="workouts-screen__eyebrow">AI LIMIT</p>
            <h3>今日のAI推定はもう使えません</h3>
            <p>
              筋トレAI推定は1日{aiLimit.limit}回までです。明日になるとWorkout MenuからのAI推定をまた使えます。
            </p>
            <span>その他ワークアウトでは、消費カロリーを自分で入力して今日の記録に追加できます。</span>
          </div>
        </section>
      ) : isSaving ? (
        <section aria-busy="true" aria-live="polite" className="workouts-screen__ai-loading">
          <div className="record-screen__loading-spinner" />
          <div className="workouts-screen__ai-loading-copy">
            <p className="workouts-screen__eyebrow">analyzing</p>
            <h3>解析中です</h3>
            <p>入力された種目、セット数、回数、重量とプロフィールの体重をもとに消費カロリーを推定しています。</p>
          </div>
        </section>
      ) : (
        <>
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

          <button className="workouts-screen__primary-button" onClick={handleLogToday} type="button">
            <Sparkles size={16} strokeWidth={2.2} />
            <span>今日の記録に追加</span>
            <Dumbbell size={16} strokeWidth={2.2} />
          </button>
        </>
      )}
    </section>
  );
}
