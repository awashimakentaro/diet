/* 【責務】
 * 今日のワークアウト実施記録一覧を描画する。
 */

'use client';

import { Flame, Trash2 } from 'lucide-react';
import type { JSX } from 'react';

import type { WorkoutLog } from '../types';

type TodayWorkoutLogListProps = {
  logs: WorkoutLog[];
  burnedKcal: number;
  activeLogId: string | null;
  onDeleteLog: (logId: string) => void;
};

export function TodayWorkoutLogList({
  logs,
  burnedKcal,
  activeLogId,
  onDeleteLog,
}: TodayWorkoutLogListProps): JSX.Element {
  return (
    <section className="workouts-screen__card workouts-screen__today-card">
      <div className="workouts-screen__card-head">
        <p className="workouts-screen__eyebrow">Today</p>
        <h2 className="workouts-screen__section-title">今日のワークアウト</h2>
        <span className="workouts-screen__section-copy">記録した運動消費は Home のカロリー収支にも反映されます。</span>
      </div>

      <div className="workouts-screen__burned-total">
        <Flame size={20} strokeWidth={2.4} />
        <div>
          <span>ワークアウト消費</span>
          <strong>{Math.round(burnedKcal)} kcal</strong>
        </div>
      </div>

      <div className="workouts-screen__log-list">
        {logs.length === 0 ? (
          <p className="workouts-screen__empty-copy">今日の実施記録はまだありません。</p>
        ) : (
          logs.map((log) => (
            <article className="workouts-screen__log-card" key={log.id}>
              <div>
                <strong>{log.name}</strong>
                <span>{log.exercises.map((exercise) => exercise.exerciseName).join(' / ')}</span>
              </div>
              <div className="workouts-screen__log-actions">
                <em>{Math.round(log.burnedKcal)} kcal</em>
                <button
                  aria-label="今日の筋トレ記録を削除"
                  disabled={activeLogId === log.id}
                  onClick={() => onDeleteLog(log.id)}
                  type="button"
                >
                  <Trash2 size={15} strokeWidth={2.2} />
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
