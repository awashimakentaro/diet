/**
 * web/src/components/web-summary-panel.tsx
 *
 * 【責務】
 * 当日の合計と目標差分を Web 版向けのサマリー UI として表示する。
 *
 * 【使用箇所】
 * - web/app/page.tsx
 * - web/app/record/page.tsx
 * - web/app/history/page.tsx
 *
 * 【やらないこと】
 * - 目標値の保存
 * - 履歴の取得
 * - 解析実行
 *
 * 【他ファイルとの関係】
 * - web/src/lib/web-formatters.ts を利用して表示文字列を整形する。
 */

import type { JSX } from 'react';

import type { WebMacro } from '@/domain/web-diet-schema';
import { formatGram, formatKcal, formatSignedValue } from '@/lib/web-formatters';

type WebSummaryPanelProps = {
  goal: WebMacro;
  totals: WebMacro;
};

type MacroKey = keyof WebMacro;

const macroDefinitions: { key: MacroKey; label: string; unit: 'kcal' | 'g' }[] = [
  { key: 'kcal', label: 'Calories', unit: 'kcal' },
  { key: 'protein', label: 'Protein', unit: 'g' },
  { key: 'fat', label: 'Fat', unit: 'g' },
  { key: 'carbs', label: 'Carbs', unit: 'g' },
];

/**
 * 当日サマリーを描画する。
 * 呼び出し元: ホーム、記録、履歴ページ。
 * @param props 目標値と現在合計
 * @returns サマリー表示 JSX
 * @remarks 副作用は存在しない。
 */
export function WebSummaryPanel({ goal, totals }: WebSummaryPanelProps): JSX.Element {
  const remainingCalories = goal.kcal - totals.kcal;

  return (
    <section className="hero-panel">
      <div className="hero-panel__headline">
        <p className="eyebrow">Today Summary</p>
        <h2>{formatKcal(totals.kcal)}</h2>
        <p>
          目標まで
          <strong>{` ${formatSignedValue(remainingCalories)} kcal`}</strong>
        </p>
      </div>
      <div className="macro-grid">
        {macroDefinitions.map((definition) => {
          const totalValue = totals[definition.key];
          const goalValue = goal[definition.key];
          const progress = calculateProgress(totalValue, goalValue);
          const diff = totalValue - goalValue;

          return (
            <article className="macro-card" key={definition.key}>
              <div className="macro-card__header">
                <span>{definition.label}</span>
                <strong>{formatDifference(diff, definition.unit)}</strong>
              </div>
              <p className="macro-card__value">
                {formatMacroValue(totalValue, definition.unit)}
              </p>
              <p className="macro-card__sub">
                Goal {formatMacroValue(goalValue, definition.unit)}
              </p>
              <div className="progress-track" aria-hidden="true">
                <div
                  className="progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

/**
 * 現在値と目標値から 0 から 100 の進捗率を返す。
 * 呼び出し元: WebSummaryPanel。
 * @param current 現在値
 * @param goal 目標値
 * @returns 進捗率
 * @remarks 副作用は存在しない。
 */
function calculateProgress(current: number, goal: number): number {
  if (goal <= 0) {
    return 0;
  }

  return Math.max(0, Math.min(100, (current / goal) * 100));
}

/**
 * 単位別の数値表示文字列を返す。
 * 呼び出し元: WebSummaryPanel。
 * @param value 表示対象の数値
 * @param unit 表示単位
 * @returns 整形済み文字列
 * @remarks 副作用は存在しない。
 */
function formatMacroValue(value: number, unit: 'kcal' | 'g'): string {
  if (unit === 'kcal') {
    return formatKcal(value);
  }

  return formatGram(value);
}

/**
 * 差分値を単位付きで表示する。
 * 呼び出し元: WebSummaryPanel。
 * @param value 差分値
 * @param unit 表示単位
 * @returns 単位付き差分文字列
 * @remarks 副作用は存在しない。
 */
function formatDifference(value: number, unit: 'kcal' | 'g'): string {
  const signedValue = formatSignedValue(value);

  if (unit === 'kcal') {
    return `${signedValue} kcal`;
  }

  return `${signedValue} g`;
}
