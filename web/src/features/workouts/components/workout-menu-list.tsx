/* 【責務】
 * 保存済みワークアウトメニュー一覧を描画する。
 */

'use client';

import { Dumbbell, Flame, Trash2 } from 'lucide-react';
import type { JSX } from 'react';

import type { WorkoutMenu } from '../types';

type WorkoutMenuListProps = {
  menus: WorkoutMenu[];
  activeMenuId: string | null;
  onDeleteMenu: (menuId: string) => void;
  onLogMenu: (menu: WorkoutMenu) => void;
};

const INTENSITY_LABELS = {
  light: '軽め',
  normal: '普通',
  hard: '高強度',
} as const;

export function WorkoutMenuList({
  menus,
  activeMenuId,
  onDeleteMenu,
  onLogMenu,
}: WorkoutMenuListProps): JSX.Element {
  return (
    <section className="workouts-screen__card">
      <div className="workouts-screen__card-head">
        <p className="workouts-screen__eyebrow">Saved Menus</p>
        <h2 className="workouts-screen__section-title">保存済みワークアウト</h2>
      </div>

      <div className="workouts-screen__menu-list">
        {menus.length === 0 ? (
          <div className="workouts-screen__empty">
            <Dumbbell size={24} strokeWidth={2.2} />
            <p>まだ筋トレメニューがありません。</p>
          </div>
        ) : (
          menus.map((menu) => (
            <article className="workouts-screen__menu-card" key={menu.id}>
              <div className="workouts-screen__menu-main">
                <div>
                  <p>{menu.name}</p>
                  <strong>{menu.kind === 'other' ? 'その他ワークアウト' : menu.exercises.map((exercise) => exercise.exerciseName).join(' / ')}</strong>
                </div>
                <span>{menu.estimatedBurnedKcal === null ? INTENSITY_LABELS[menu.intensity] : `${Math.round(menu.estimatedBurnedKcal)} kcal`}</span>
              </div>

              {menu.kind === 'strength' ? (
                <div className="workouts-screen__exercise-summary-list">
                  {menu.exercises.map((exercise) => (
                    <div className="workouts-screen__exercise-summary" key={exercise.exerciseName}>
                      <strong>{exercise.exerciseName}</strong>
                      <span>{exercise.sets} sets</span>
                      <span>{exercise.reps} reps</span>
                      <span>{exercise.weightKg} kg</span>
                      <span>{exercise.durationMinutes} min</span>
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="workouts-screen__menu-stats">
                <span>{menu.durationMinutes} min</span>
                {menu.kind === 'strength' ? (
                  <>
                    <span>{menu.exercises.length} 種目</span>
                    <span>{INTENSITY_LABELS[menu.intensity]}</span>
                  </>
                ) : (
                  <span>その他</span>
                )}
              </div>

              {menu.note.length > 0 ? (
                <p className="workouts-screen__menu-note">{menu.note}</p>
              ) : null}

              <div className="workouts-screen__menu-actions">
                <button disabled={activeMenuId === menu.id} onClick={() => onLogMenu(menu)} type="button">
                  <Flame size={15} strokeWidth={2.2} />
                  <span>今日やった</span>
                </button>
                <button disabled={activeMenuId === menu.id} onClick={() => onDeleteMenu(menu.id)} type="button">
                  <Trash2 size={15} strokeWidth={2.2} />
                  <span>削除</span>
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
