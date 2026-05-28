/* 【責務】
 * Foods 画面で保存済みワークアウトメニューを食品カード相当の密度で描画する。
 */

'use client';

import { Bookmark, Pencil, Trash2 } from 'lucide-react';
import type { JSX } from 'react';

import type { WorkoutMenu } from '../types';

type WorkoutMenuLibraryCardProps = {
  menu: WorkoutMenu;
  activeAction: 'delete' | 'reuse' | null;
  onDelete: (menuId: string) => void;
  onEdit: (menu: WorkoutMenu) => void;
  onReuse: (menu: WorkoutMenu) => void;
};

const INTENSITY_LABELS = {
  light: '軽め',
  normal: '普通',
  hard: '高強度',
} as const;

export function WorkoutMenuLibraryCard({
  menu,
  activeAction,
  onDelete,
  onEdit,
  onReuse,
}: WorkoutMenuLibraryCardProps): JSX.Element {
  const isDeleting = activeAction === 'delete';
  const isReusing = activeAction === 'reuse';
  const isBusy = activeAction !== null;

  return (
    <article className="food-card workout-menu-library-card">
      <div className="food-card__row">
        <div className="food-card__main">
          <h3 className="food-card__name">{menu.name}</h3>

          <div className="food-card__metrics">
            <span className="food-card__macro food-card__macro--p">
              {menu.durationMinutes}分
            </span>
            <span className="food-card__macro food-card__macro--f">
              {menu.kind === 'other' ? 'その他' : `${menu.exercises.length}種目`}
            </span>
            <span className="food-card__macro food-card__macro--c">
              {INTENSITY_LABELS[menu.intensity]}
            </span>
            <div className="food-card__kcal">
              <strong>{menu.estimatedBurnedKcal === null ? '--' : Math.round(menu.estimatedBurnedKcal)}</strong>
              <span>kcal</span>
            </div>
          </div>
        </div>

        <div className="food-card__actions">
          <button
            aria-label="筋トレメニューを編集"
            className="food-card__btn food-card__btn--edit"
            disabled={isBusy}
            onClick={() => onEdit(menu)}
            type="button"
          >
            <Pencil size={13} strokeWidth={2} />
          </button>
          <button
            aria-label="筋トレメニューを削除"
            className="food-card__btn food-card__btn--delete"
            disabled={isBusy}
            onClick={() => onDelete(menu.id)}
            type="button"
          >
            {isDeleting ? <span className="food-card__spinner" /> : <Trash2 size={13} strokeWidth={2} />}
          </button>
          <button
            className="food-card__btn food-card__btn--reuse"
            disabled={isBusy}
            onClick={() => onReuse(menu)}
            type="button"
          >
            {isReusing ? (
              <>
                <span className="food-card__spinner" />
                <span>追加中...</span>
              </>
            ) : (
              <>
                <Bookmark size={13} strokeWidth={2} />
                <span>今日やった</span>
              </>
            )}
          </button>
        </div>
      </div>

      {menu.kind === 'strength' && menu.exercises.length > 0 ? (
        <p className="workout-menu-library-card__detail">
          {menu.exercises.map((exercise) => exercise.exerciseName).join(' / ')}
        </p>
      ) : null}
    </article>
  );
}
