/**
 * web/app/history/page.tsx
 *
 * 【責務】
 * Web 版の履歴画面として、日付単位の食事記録一覧を表示する。
 *
 * 【使用箇所】
 * - `/history` ルートで表示される。
 *
 * 【やらないこと】
 * - 実データ削除
 * - 編集保存
 * - 日付切替の状態管理
 *
 * 【他ファイルとの関係】
 * - mockMeals と WebSummaryPanel を使い、History タブ相当の情報密度を表現する。
 */

import type { JSX } from 'react';

import { WebAppShell } from '@/components/web-app-shell';
import { WebSectionCard } from '@/components/web-section-card';
import { WebSummaryPanel } from '@/components/web-summary-panel';
import { mockGoal, mockMeals, mockTodayTotals } from '@/data/mock-diet-data';
import { formatDateLabel, formatGram, formatKcal, formatTimeLabel } from '@/lib/web-formatters';

/**
 * 履歴画面を描画する。
 * 呼び出し元: Next.js `/history` ルート。
 * @returns 履歴画面 JSX
 * @remarks 副作用は存在しない。
 */
export default function HistoryPage(): JSX.Element {
  const selectedDate = mockMeals[0]?.recordedAt ?? mockGoal.updatedAt;

  return (
    <WebAppShell currentPath="/history">
      <WebSummaryPanel goal={mockGoal.totals} totals={mockTodayTotals} />

      <WebSectionCard
        description="前日・翌日切り替えの位置に日付ナビゲーションを置き、選択日の履歴を一覧表示する。"
        eyebrow="履歴"
        title={formatDateLabel(selectedDate)}
      >
        <div className="date-strip">
          <button className="secondary-button" type="button">前日</button>
          <strong>{formatDateLabel(selectedDate)}</strong>
          <button className="secondary-button" type="button">翌日</button>
        </div>
        <div className="detail-stack">
          {mockMeals.map((meal) => (
            <article className="history-card" key={meal.id}>
              <div className="history-card__header">
                <div>
                  <p className="list-row__title">{meal.menuName}</p>
                  <p className="list-row__meta">
                    {formatTimeLabel(meal.recordedAt)} / source: {meal.source}
                  </p>
                </div>
                <strong>{formatKcal(meal.totals.kcal)}</strong>
              </div>
              <p className="history-card__prompt">{meal.originalText}</p>
              <div className="stack-list">
                {meal.items.map((item) => (
                  <div className="list-row" key={item.id}>
                    <div>
                      <p className="list-row__title">{item.name}</p>
                      <p className="list-row__meta">{item.amount}</p>
                    </div>
                    <div className="macro-inline">
                      <span>P {formatGram(item.protein)}</span>
                      <span>F {formatGram(item.fat)}</span>
                      <span>C {formatGram(item.carbs)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
        <button className="danger-button" type="button">この日の記録をすべて削除</button>
      </WebSectionCard>
    </WebAppShell>
  );
}
