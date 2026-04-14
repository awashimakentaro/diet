/* 【責務】
 * Record 画面の生成下書き合計サマリーを描画する。
 */

import type { JSX } from 'react';

type RecordDraftSummaryProps = {
  totals: {
    kcal: number;
    protein: number;
    fat: number;
    carbs: number;
  };
};

export function RecordDraftSummary({
  totals,
}: RecordDraftSummaryProps): JSX.Element {
  return (
    <div className="record-screen__draft-summary">
      <article className="record-screen__draft-summary-card record-screen__draft-summary-card--kcal">
        <span>Total</span>
        <strong>{totals.kcal} kcal</strong>
      </article>
      <span className="food-card__macro food-card__macro--p">
        P {totals.protein}g
      </span>
      <span className="food-card__macro food-card__macro--f">
        F {totals.fat}g
      </span>
      <span className="food-card__macro food-card__macro--c">
        C {totals.carbs}g
      </span>
    </div>
  );
}
