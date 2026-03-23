/**
 * web/src/components/web-section-card.tsx
 *
 * 【責務】
 * Web 版の共通セクションカード枠を描画する。
 *
 * 【使用箇所】
 * - web/app/page.tsx
 * - web/app/record/page.tsx
 * - web/app/history/page.tsx
 * - web/app/foods/page.tsx
 * - web/app/settings/page.tsx
 *
 * 【やらないこと】
 * - ページ遷移制御
 * - データ取得
 * - 栄養計算
 *
 * 【他ファイルとの関係】
 * - web/src/components/web-app-shell.tsx と組み合わせて統一レイアウトを構成する。
 */

import type { JSX, ReactNode } from 'react';

type WebSectionCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

/**
 * 共通カードコンテナを描画する。
 * 呼び出し元: 各ページの section。
 * @param props セクションの見出しと本文
 * @returns セクションカード JSX
 * @remarks 副作用は存在しない。
 */
export function WebSectionCard({
  eyebrow,
  title,
  description,
  children,
}: WebSectionCardProps): JSX.Element {
  return (
    <section className="panel">
      <div className="panel-header">
        <p className="eyebrow">{eyebrow}</p>
        <div className="panel-copy">
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}
