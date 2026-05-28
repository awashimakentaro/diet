/* 【責務】
 * History 画面のワークアウト実施記録カードを描画する。
 */

'use client';

import { Bookmark, Pencil, Trash2 } from 'lucide-react';
import type { JSX } from 'react';

import type { WorkoutLog } from '../types';

type WorkoutLogHistoryCardProps = {
  log: WorkoutLog;
  isSaving: boolean;
  onDelete: (logId: string) => void;
  onEdit: (log: WorkoutLog) => void;
  onSave: (log: WorkoutLog) => void;
};

export function WorkoutLogHistoryCard({
  log,
  isSaving,
  onDelete,
  onEdit,
  onSave,
}: WorkoutLogHistoryCardProps): JSX.Element {
  const intensityLabel = log.intensity === 'hard' ? '高強度' : log.intensity === 'light' ? '軽め' : '普通';
  const detailRowsSource = log.kind === 'other'
    ? [log.note || log.exercises[0]?.exerciseName || log.name]
    : log.exercises.slice(0, 3).map((exercise) => (
      `${exercise.exerciseName} ${exercise.sets}set x ${exercise.reps}rep ${exercise.weightKg}kg / ${exercise.durationMinutes}分`
    ));
  const detailRows = detailRowsSource.length > 0 ? detailRowsSource : [log.name];

  return (
    <article className="history-screen__card app-card workout-history-card">
      <div className="history-screen__card-head">
        <div className="history-screen__meal-meta">
          <h2>{log.name}</h2>
        </div>
        <div className="history-screen__kcal-box">
          <strong>{Math.round(log.burnedKcal)}</strong>
          <span>kcal</span>
        </div>
      </div>

      <div className="food-card__metrics">
        <span className="food-card__macro food-card__macro--p">
          {log.durationMinutes}分
        </span>
        <span className="food-card__macro food-card__macro--f">
          {log.kind === 'other' ? 'その他' : `${log.exercises.length}種目`}
        </span>
        <span className="food-card__macro food-card__macro--c">
          {intensityLabel}
        </span>
      </div>

      <div className="history-screen__item-list">
        {detailRows.map((detail) => (
          <div className="history-screen__item-row" key={detail}>
            <span>{detail}</span>
            <div>
              <strong>{Math.round(log.burnedKcal)} kcal</strong>
            </div>
          </div>
        ))}
      </div>

      <div className="history-screen__actions">
        <button
          className="history-screen__action history-screen__action--edit"
          onClick={() => onEdit(log)}
          type="button"
        >
          <Pencil size={14} strokeWidth={1.9} />
          <span>編集</span>
        </button>
        <button
          className="history-screen__action history-screen__action--delete"
          onClick={() => onDelete(log.id)}
          type="button"
        >
          <Trash2 size={14} strokeWidth={1.9} />
          <span>削除</span>
        </button>
        <button
          className="history-screen__action history-screen__action--primary"
          disabled={isSaving}
          onClick={() => onSave(log)}
          type="button"
        >
          {isSaving ? (
            <>
              <span className="history-screen__action-spinner" />
              <span>保存中...</span>
            </>
          ) : (
            <>
              <Bookmark size={14} strokeWidth={1.9} />
              <span>保存</span>
            </>
          )}
        </button>
      </div>
    </article>
  );
}
