/* 【責務】
 * History 画面でワークアウト実施記録を編集する簡易パネルを描画する。
 */

'use client';

import { CheckCircle2, Plus, Sparkles, Trash2, X } from 'lucide-react';
import { useEffect, useRef, type JSX } from 'react';

import type { WorkoutExerciseFormValues, WorkoutIntensity, WorkoutKind } from '../types';

export type WorkoutLogEditorValues = {
  kind: WorkoutKind;
  name: string;
  durationMinutes: string;
  intensity: WorkoutIntensity;
  burnedKcal: string;
  note: string;
  exercises: WorkoutExerciseFormValues[];
};

export type WorkoutLogEditorValidationState = {
  invalidKeys: string[];
  focusKey: string | null;
  requestId: number;
};

type WorkoutLogEditorPanelProps = {
  values: WorkoutLogEditorValues;
  isSaving: boolean;
  title?: string;
  onChange: (field: keyof WorkoutLogEditorValues, value: string) => void;
  onExerciseChange: (index: number, field: keyof WorkoutExerciseFormValues, value: string) => void;
  onAddExercise: () => void;
  onRemoveExercise: (index: number) => void;
  onEstimate: () => void;
  onClose: () => void;
  onSave: () => void;
  isEstimating?: boolean;
  validation?: WorkoutLogEditorValidationState;
};

export function WorkoutLogEditorPanel({
  values,
  isSaving,
  title = 'ワークアウトを編集',
  onChange,
  onExerciseChange,
  onAddExercise,
  onRemoveExercise,
  onEstimate,
  onClose,
  onSave,
  isEstimating = false,
  validation = { invalidKeys: [], focusKey: null, requestId: 0 },
}: WorkoutLogEditorPanelProps): JSX.Element {
  const inputRefs = useRef<Record<string, HTMLInputElement | HTMLTextAreaElement | null>>({});
  const invalidKeys = new Set(validation.invalidKeys);

  useEffect(() => {
    if (validation.focusKey === null || validation.requestId === 0) {
      return;
    }

    inputRefs.current[validation.focusKey]?.focus();
  }, [validation.focusKey, validation.requestId]);

  function setInputRef(key: string) {
    return (element: HTMLInputElement | HTMLTextAreaElement | null): void => {
      inputRefs.current[key] = element;
    };
  }

  function fieldClassName(key: string, extraClassName = ''): string {
    const baseClassName = extraClassName.length > 0
      ? `workouts-screen__field ${extraClassName}`
      : 'workouts-screen__field';

    return invalidKeys.has(key)
      ? `${baseClassName} workouts-screen__field--error`
      : baseClassName;
  }

  function exerciseKey(index: number, field: keyof WorkoutExerciseFormValues): string {
    return `exercise.${index}.${field}`;
  }

  return (
    <div className="foods-screen__editor-backdrop">
      <section className="foods-screen__editor-panel workout-log-editor">
        <div className="record-screen__editor-topbar">
          <div>
            <p className="record-screen__field-label">workout editor</p>
            <h2 className="record-screen__editor-title">{title}</h2>
          </div>
          <button aria-label="閉じる" className="record-screen__editor-close" onClick={onClose} type="button">
            <X size={16} strokeWidth={2.4} />
          </button>
        </div>

        <div className="record-screen__editor-body">
          {isEstimating ? (
            <section aria-busy="true" aria-live="polite" className="workouts-screen__ai-loading workout-log-editor__ai-loading">
              <div className="record-screen__loading-spinner" />
              <div className="workouts-screen__ai-loading-copy">
                <p className="workouts-screen__eyebrow">recalculating</p>
                <h3>再計算しています</h3>
                <p>入力された種目、重量、回数、セット数、1セットの分数とプロフィール情報をもとに消費カロリーを推定しています。</p>
              </div>
            </section>
          ) : (
            <>
              <div className="workouts-screen__form-grid">
                <label className={fieldClassName('name', 'workouts-screen__field--wide')}>
                  <span>ワークアウト名</span>
                  <input
                    aria-invalid={invalidKeys.has('name')}
                    ref={setInputRef('name')}
                    value={values.name}
                    onChange={(event) => onChange('name', event.target.value)}
                  />
                </label>
                <label className={fieldClassName('burnedKcal')}>
                  <span>消費 kcal</span>
                  <input
                    aria-invalid={invalidKeys.has('burnedKcal')}
                    inputMode="numeric"
                    ref={setInputRef('burnedKcal')}
                    value={values.burnedKcal}
                    onChange={(event) => onChange('burnedKcal', event.target.value)}
                  />
                </label>
                <label className="workouts-screen__field workouts-screen__field--wide">
                  <span>メモ</span>
                  <textarea rows={3} value={values.note} onChange={(event) => onChange('note', event.target.value)} />
                </label>
              </div>

              {values.kind === 'strength' ? (
                <>
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
                          <label className={fieldClassName(exerciseKey(index, 'exerciseName'), 'workouts-screen__field--wide')}>
                            <span>種目名</span>
                            <input
                              aria-invalid={invalidKeys.has(exerciseKey(index, 'exerciseName'))}
                              onChange={(event) => onExerciseChange(index, 'exerciseName', event.target.value)}
                              ref={setInputRef(exerciseKey(index, 'exerciseName'))}
                              type="text"
                              value={exercise.exerciseName}
                            />
                          </label>
                          <label className={fieldClassName(exerciseKey(index, 'weightKg'))}>
                            <span>重量 kg</span>
                            <input
                              aria-invalid={invalidKeys.has(exerciseKey(index, 'weightKg'))}
                              inputMode="decimal"
                              onChange={(event) => onExerciseChange(index, 'weightKg', event.target.value)}
                              ref={setInputRef(exerciseKey(index, 'weightKg'))}
                              type="text"
                              value={exercise.weightKg}
                            />
                          </label>
                          <label className={fieldClassName(exerciseKey(index, 'reps'))}>
                            <span>回数</span>
                            <input
                              aria-invalid={invalidKeys.has(exerciseKey(index, 'reps'))}
                              inputMode="numeric"
                              onChange={(event) => onExerciseChange(index, 'reps', event.target.value)}
                              ref={setInputRef(exerciseKey(index, 'reps'))}
                              type="text"
                              value={exercise.reps}
                            />
                          </label>
                          <label className={fieldClassName(exerciseKey(index, 'sets'))}>
                            <span>セット数</span>
                            <input
                              aria-invalid={invalidKeys.has(exerciseKey(index, 'sets'))}
                              inputMode="numeric"
                              onChange={(event) => onExerciseChange(index, 'sets', event.target.value)}
                              ref={setInputRef(exerciseKey(index, 'sets'))}
                              type="text"
                              value={exercise.sets}
                            />
                          </label>
                          <label className={fieldClassName(exerciseKey(index, 'durationMinutes'))}>
                            <span>1セットの分数</span>
                            <input
                              aria-invalid={invalidKeys.has(exerciseKey(index, 'durationMinutes'))}
                              inputMode="numeric"
                              onChange={(event) => onExerciseChange(index, 'durationMinutes', event.target.value)}
                              ref={setInputRef(exerciseKey(index, 'durationMinutes'))}
                              type="text"
                              value={exercise.durationMinutes}
                            />
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="profile-actions">
                    <button className="workouts-screen__secondary-button" onClick={onAddExercise} type="button">
                      <Plus size={16} strokeWidth={2.2} />
                      <span>トレーニングを手動追加</span>
                    </button>
                    <button className="workouts-screen__secondary-button" onClick={onEstimate} type="button">
                      <Sparkles size={16} strokeWidth={2.2} />
                      <span>AIで消費kcal再計算</span>
                    </button>
                  </div>
                </>
              ) : null}

              <button
                className={isSaving ? 'record-screen__confirm-button record-screen__confirm-button--loading' : 'record-screen__confirm-button'}
                disabled={isSaving}
                onClick={onSave}
                type="button"
              >
                {isSaving ? (
                  <>
                    <span className="record-screen__loading-spinner record-screen__loading-spinner--inline" />
                    <span>保存中です...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} strokeWidth={2.4} />
                    <span>この内容で保存する</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
