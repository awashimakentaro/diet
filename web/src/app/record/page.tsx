/**
 * web/app/record/page.tsx
 *
 * 【責務】
 * Web 版の記録画面として、AI 入力導線と保存前プレビューを表示する。
 *
 * 【使用箇所】
 * - `/record` ルートで表示される。
 *
 * 【やらないこと】
 * - 実際の AI 解析実行
 * - 保存処理
 * - カメラ連携
 *
 * 【他ファイルとの関係】
 * - mockRecordDraft を読み込み、モバイル版 Record タブの Web 置き換え UI を示す。
 */

import type { JSX } from 'react';

import { WebAppShell } from '@/components/web-app-shell';
import { WebSectionCard } from '@/components/web-section-card';
import { WebSummaryPanel } from '@/components/web-summary-panel';
import { mockGoal, mockRecordDraft, mockTodayTotals } from '@/data/mock-diet-data';
import { formatGram, formatKcal } from '@/lib/web-formatters';

/**
 * 記録画面を描画する。
 * 呼び出し元: Next.js `/record` ルート。
 * @returns 記録画面 JSX
 * @remarks 副作用は存在しない。
 */
export default function RecordPage(): JSX.Element {
  return (
    <WebAppShell currentPath="/record">
      <WebSummaryPanel goal={mockGoal.totals} totals={mockTodayTotals} />

      <WebSectionCard
        description="テキスト入力、画像入力、手入力の 3 つの入口をモバイル版と同じ順番で配置する。"
        eyebrow="記録"
        title="食事を入力"
      >
        <div className="input-panel">
          <textarea
            className="prompt-box"
            defaultValue="鶏むね肉、玄米、ブロッコリー、ゆで卵を食べた"
            readOnly
          />
          <div className="button-row">
            <button className="primary-button" type="button">テキスト解析</button>
            <button className="secondary-button" type="button">画像を追加</button>
            <button className="secondary-button" type="button">手入力</button>
          </div>
        </div>
      </WebSectionCard>

      <WebSectionCard
        description="保存前のメニュー名、元テキスト、食品ごとの栄養値をそのまま確認する。"
        eyebrow="下書き"
        title={mockRecordDraft.menuName}
      >
        <div className="detail-stack">
          <div className="soft-card">
            <p className="soft-card__label">Original Text</p>
            <p>{mockRecordDraft.originalText}</p>
          </div>
          <div className="warning-box">
            {mockRecordDraft.warnings.map((warning) => (
              <p key={warning}>{warning}</p>
            ))}
          </div>
          <div className="stack-list">
            {mockRecordDraft.items.map((item) => (
              <article className="list-row list-row--tall" key={item.id}>
                <div>
                  <p className="list-row__title">{item.name}</p>
                  <p className="list-row__meta">{item.amount}</p>
                </div>
                <div className="macro-inline">
                  <span>{formatKcal(item.kcal)}</span>
                  <span>P {formatGram(item.protein)}</span>
                  <span>F {formatGram(item.fat)}</span>
                  <span>C {formatGram(item.carbs)}</span>
                </div>
              </article>
            ))}
          </div>
          <div className="summary-strip">
            <strong>{formatKcal(mockRecordDraft.totals.kcal)}</strong>
            <span>P {formatGram(mockRecordDraft.totals.protein)}</span>
            <span>F {formatGram(mockRecordDraft.totals.fat)}</span>
            <span>C {formatGram(mockRecordDraft.totals.carbs)}</span>
          </div>
        </div>
      </WebSectionCard>
    </WebAppShell>
  );
}
