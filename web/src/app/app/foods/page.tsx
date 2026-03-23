/**
 * web/app/foods/page.tsx
 *
 * 【責務】
 * Web 版の食品ライブラリ画面として、再利用メニューと単品食品の一覧を表示する。
 *
 * 【使用箇所】
 * - `/app/foods` ルートで表示される。
 *
 * 【やらないこと】
 * - 検索 API 実行
 * - 保存 / 削除処理
 * - 履歴追加処理
 *
 * 【他ファイルとの関係】
 * - mockLibraryEntries を用いて Foods タブの Web UI を構成する。
 */

import type { JSX } from 'react';

import { WebAppShell } from '@/components/web-app-shell';
import { WebSectionCard } from '@/components/web-section-card';
import { mockLibraryEntries } from '@/data/mock-diet-data';
import { formatGram, formatKcal } from '@/lib/web-formatters';

/**
 * 食品ライブラリ画面を描画する。
 * 呼び出し元: Next.js `/app/foods` ルート。
 * @returns 食品ライブラリ画面 JSX
 * @remarks 副作用は存在しない。
 */
export default function FoodsPage(): JSX.Element {
  return (
    <WebAppShell currentPath="/app/foods">
      <WebSectionCard
        description="検索と追加ボタンを上に置き、その下に保存済みメニューを一覧表示する。"
        eyebrow="ライブラリ"
        title="保存済みの食品"
      >
        <div className="toolbar-row">
          <input className="search-input" defaultValue="" placeholder="食品名で検索" readOnly />
          <button className="primary-button" type="button">食品を追加</button>
        </div>
        <div className="three-column-grid">
          {mockLibraryEntries.map((entry) => (
            <article className="library-card" key={entry.id}>
              <div className="soft-card__header">
                <h3>{entry.name}</h3>
                <span>{formatKcal(entry.totals.kcal)}</span>
              </div>
              <p>{entry.description}</p>
              <div className="tag-row">
                {entry.tags.map((tag) => (
                  <span className="tag" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
              <div className="macro-inline macro-inline--spaced">
                <span>P {formatGram(entry.totals.protein)}</span>
                <span>F {formatGram(entry.totals.fat)}</span>
                <span>C {formatGram(entry.totals.carbs)}</span>
              </div>
              <div className="button-row">
                <button className="primary-button" type="button">今日食べた</button>
                <button className="secondary-button" type="button">編集</button>
              </div>
            </article>
          ))}
        </div>
      </WebSectionCard>
    </WebAppShell>
  );
}
