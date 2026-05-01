/* 【責務】
 * Foods の食品編集パネルで栄養合計を表示する。
 */

'use client';

import type { JSX } from 'react';

type FoodEntryDraftSummaryProps = {
  draftTotals: {
    kcal: number;
    protein: number;
    fat: number;
    carbs: number;
  };
};

export function FoodEntryDraftSummary({
  draftTotals,
}: FoodEntryDraftSummaryProps): JSX.Element {
  return (
    <div className="record-screen__draft-summary">
      <article className="record-screen__draft-summary-card record-screen__draft-summary-card--kcal">
        <span>Total</span>
        <strong>{draftTotals.kcal} kcal</strong>
      </article>
      <article className="record-screen__draft-summary-card">
        <span>P</span>
        <strong>{draftTotals.protein}g</strong>
      </article>
      <article className="record-screen__draft-summary-card">
        <span>F</span>
        <strong>{draftTotals.fat}g</strong>
      </article>
      <article className="record-screen__draft-summary-card">
        <span>C</span>
        <strong>{draftTotals.carbs}g</strong>
      </article>
    </div>
  );
}
