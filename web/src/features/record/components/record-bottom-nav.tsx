/**
 * web/src/features/record/components/record-bottom-nav.tsx
 *
 * 【責務】
 * Record 画面下部のモバイル調ナビゲーションを描画する。
 *
 * 【使用されるエージェント / 処理フロー】
 * - record-screen.tsx から呼ばれる。
 * - 現在位置に応じて見た目だけアクティブ状態を切り替える。
 *
 * 【やらないこと】
 * - 認証処理
 * - ルート保護
 * - 画面ごとのロジック実装
 *
 * 【他ファイルとの関係】
 * - web/src/config/paths.ts を利用して各ページへの href を組み立てる。
 */

import Link from 'next/link';
import { Clock3, Plus, Search, Settings } from 'lucide-react';
import type { JSX } from 'react';

import { paths } from '@/config/paths';

type RecordBottomNavProps = {
  currentPath: string;
};

export function RecordBottomNav({
  currentPath,
}: RecordBottomNavProps): JSX.Element {
  const items = [
    { href: paths.app.record.getHref(), label: '記録', icon: Plus, activeStroke: 3 },
    { href: paths.app.history.getHref(), label: '履歴', icon: Clock3, activeStroke: 2.2 },
    { href: paths.app.foods.getHref(), label: '食品', icon: Search, activeStroke: 2.2 },
    { href: paths.app.settings.getHref(), label: '設定', icon: Settings, activeStroke: 2.2 },
  ] as const;

  return (
    <nav aria-label="Primary" className="record-screen__nav">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = currentPath === item.href;

        return (
          <Link
            className={isActive ? 'record-screen__nav-item record-screen__nav-item--active' : 'record-screen__nav-item'}
            href={item.href}
            key={item.href}
          >
            <Icon size={22} strokeWidth={item.activeStroke} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
