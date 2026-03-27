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

import { motion, useReducedMotion } from 'framer-motion';
import type { JSX } from 'react';

import { PfcDonutChart } from './pfc-donut-chart';

type MacroSummary = {
  label: string;
  current: number;
  target: number;
  tone: 'protein' | 'fat' | 'carbs';
  progress: number;
};

export type NutritionSummary = {
  kcal: number;
  goalKcal: number;
  macros: MacroSummary[];
};

type RecordSummaryCardProps = {
  summary: NutritionSummary;
};

export function RecordSummaryCard({
  summary,
}: RecordSummaryCardProps): JSX.Element {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      className="record-screen__summary-card"
      initial={{ opacity: 0, y: 16 }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { duration: 0.55, ease: 'easeOut' as const }
      }
    >
      <div className="record-screen__summary-layout">
        <div className="record-screen__summary-content">
          <div className="record-screen__summary-head">
            <div>
              <p className="record-screen__eyebrow">栄養状況</p>
              <div className="record-screen__headline">
                <strong>{summary.kcal}</strong>
                <span>/ {summary.goalKcal} kcal</span>
              </div>
            </div>
          </div>
        </div>

        <div className="record-screen__summary-chart">
          <PfcDonutChart
            carbs={summary.macros.find((m) => m.tone === 'carbs')?.current ?? 0}
            fat={summary.macros.find((m) => m.tone === 'fat')?.current ?? 0}
            protein={summary.macros.find((m) => m.tone === 'protein')?.current ?? 0}
            size={80}
          />
        </div>
      </div>



      <div className="record-screen__macro-list">
        {summary.macros.map((macro) => (
          <article className="record-screen__macro-row" key={macro.label}>
            <div className="record-screen__macro-meta">
              <p className="record-screen__macro-label">{macro.label}</p>
              <div className="record-screen__macro-values">
                <strong>{macro.current}</strong>
                <span>/ {macro.target}</span>
              </div>
            </div>
            <div className="record-screen__track">
              <motion.div
                className={`record-screen__fill record-screen__fill--${macro.tone}`}
                initial={{ width: 0 }}
                animate={{ width: `${macro.progress}%` }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { duration: 0.7, ease: 'easeOut' as const }
                }
              />
            </div>
          </article>
        ))}
      </div>
    </motion.section>
  );
}
