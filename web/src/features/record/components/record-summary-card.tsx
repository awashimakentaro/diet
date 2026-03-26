/**
 * web/src/features/record/components/record-summary-card.tsx
 *
 * 【責務】
 * Nutrition Status の PFC サマリーカードを描画する。
 *
 * 【使用されるエージェント / 処理フロー】
 * - Home 画面などから呼ばれる。
 * - 呼び出し元が組み立てたサマリーを受け取る。
 *
 * 【やらないこと】
 * - フォーム state 管理
 * - API 通信
 * - 画面遷移
 *
 * 【他ファイルとの関係】
 * - use-record-screen.ts の DailySummary 構造に依存する。
 */

import type { JSX } from 'react';

type MacroSummary = {
  label: string;
  current: number;
  target: number;
  remaining: number;
  tone: 'protein' | 'fat' | 'carbs';
  progress: number;
};

export type NutritionSummary = {
  kcal: number;
  goalKcal: number;
  leftKcal: number;
  macros: MacroSummary[];
};

type RecordSummaryCardProps = {
  summary: NutritionSummary;
};

export function RecordSummaryCard({
  summary,
}: RecordSummaryCardProps): JSX.Element {
  return (
    <section className="record-screen__summary-card">
      <div className="record-screen__summary-head">
        <div>
          <p className="record-screen__eyebrow">Nutrition Status</p>
          <div className="record-screen__headline">
            <strong>{summary.kcal}</strong>
            <span>/ {summary.goalKcal} kcal</span>
          </div>
        </div>
        <div className="record-screen__left-pill">LEFT: {summary.leftKcal}</div>
      </div>

      <div className="record-screen__macro-list">
        {summary.macros.map((macro) => (
          <article className="record-screen__macro-row" key={macro.label}>
            <div className="record-screen__macro-meta">
              <p className="record-screen__macro-label">{macro.label}</p>
              <div className="record-screen__macro-values">
                <strong>{macro.current}</strong>
                <span>/ {macro.target}</span>
                <em>{macro.remaining}</em>
              </div>
            </div>
            <div className="record-screen__track">
              <div
                className={`record-screen__fill record-screen__fill--${macro.tone}`}
                style={{ width: `${macro.progress}%` }}
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
