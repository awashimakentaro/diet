/**
 * web/src/components/app-bottom-nav.tsx
 *
 * 【責務】
 * Web アプリ共通の主要ナビゲーションを描画する。
 *
 * 【使用されるエージェント / 処理フロー】
 * - record/history などの画面から呼ばれる。
 * - 現在のパスに応じてアクティブ表示を切り替える。
 * - スマホでは画面下部、デスクトップでは左サイドのナビゲーションとして機能する。
 *
 * 【やらないこと】
 * - 認証処理
 * - ルート保護
 * - 画面固有のロジック
 *
 * 【他ファイルとの関係】
 * - web/src/config/paths.ts を使って各画面へのリンクを生成する。
 * - web/src/styles/globals.css の下部ナビ用クラスに依存する。
 */

import Link from 'next/link';
import { Clock3, House, Plus, Search, Settings } from 'lucide-react';
import type { JSX } from 'react';

import { paths } from '@/config/paths';

type AppBottomNavProps = {
  currentPath: string;
};

export function AppBottomNav({
  currentPath,
}: AppBottomNavProps): JSX.Element {
  const items = [
    { href: paths.app.root.getHref(), label: 'ホーム', icon: House, activeStroke: 2.2 },
    { href: paths.app.record.getHref(), label: '記録', icon: Plus, activeStroke: 2.6 },
    { href: paths.app.history.getHref(), label: '履歴', icon: Clock3, activeStroke: 2 },
    { href: paths.app.foods.getHref(), label: '食品', icon: Search, activeStroke: 2 },
    { href: paths.app.settings.getHref(), label: '設定', icon: Settings, activeStroke: 2 },
  ] as const;

  return (
    <nav aria-label="Primary" className="app-bottom-nav">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = currentPath === item.href;

        return (
          <Link
            className={isActive ? 'app-bottom-nav__item app-bottom-nav__item--active' : 'app-bottom-nav__item'}
            href={item.href}
            key={item.href}
          >
            <Icon size={18} strokeWidth={item.activeStroke} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
