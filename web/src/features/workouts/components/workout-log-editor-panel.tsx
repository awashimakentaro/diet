/* 【責務】
 * History 画面でワークアウト実施記録を編集する簡易パネルを描画する。
 */

'use client';

import { CheckCircle2, X } from 'lucide-react';
import type { JSX } from 'react';

import type { WorkoutIntensity, WorkoutKind } from '../types';

export type WorkoutLogEditorValues = {
  kind: WorkoutKind;
  name: string;
  durationMinutes: string;
  intensity: WorkoutIntensity;
  burnedKcal: string;
  note: string;
};

type WorkoutLogEditorPanelProps = {
  values: WorkoutLogEditorValues;
  isSaving: boolean;
  title?: string;
  onChange: (field: keyof WorkoutLogEditorValues, value: string) => void;
  onClose: () => void;
  onSave: () => void;
};

export function WorkoutLogEditorPanel({
  values,
  isSaving,
  title = 'ワークアウトを編集',
  onChange,
  onClose,
  onSave,
}: WorkoutLogEditorPanelProps): JSX.Element {
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
          <div className="workouts-screen__form-grid">
            <label className="workouts-screen__field workouts-screen__field--wide">
              <span>ワークアウト名</span>
              <input value={values.name} onChange={(event) => onChange('name', event.target.value)} />
            </label>
            <label className="workouts-screen__field">
              <span>時間 分</span>
              <input inputMode="numeric" value={values.durationMinutes} onChange={(event) => onChange('durationMinutes', event.target.value)} />
            </label>
            <label className="workouts-screen__field">
              <span>消費 kcal</span>
              <input inputMode="numeric" value={values.burnedKcal} onChange={(event) => onChange('burnedKcal', event.target.value)} />
            </label>
            <label className="workouts-screen__field">
              <span>種類</span>
              <select value={values.kind} onChange={(event) => onChange('kind', event.target.value)}>
                <option value="strength">筋トレ</option>
                <option value="other">その他</option>
              </select>
            </label>
            <label className="workouts-screen__field">
              <span>強度</span>
              <select value={values.intensity} onChange={(event) => onChange('intensity', event.target.value)}>
                <option value="light">軽め</option>
                <option value="normal">普通</option>
                <option value="hard">高強度</option>
              </select>
            </label>
            <label className="workouts-screen__field workouts-screen__field--wide">
              <span>メモ</span>
              <textarea rows={3} value={values.note} onChange={(event) => onChange('note', event.target.value)} />
            </label>
          </div>

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
        </div>
      </section>
    </div>
  );
}
