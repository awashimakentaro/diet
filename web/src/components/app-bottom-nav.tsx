/*
 * 【責務】
 * Web アプリ共通の主要ナビゲーションを描画する。
 */

import Link from 'next/link';
import { Clock3, Dumbbell, House, Plus, Search, Settings } from 'lucide-react';
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
    { href: paths.app.workouts.getHref(), label: '筋トレ', icon: Dumbbell, activeStroke: 2 },
    { href: paths.app.settings.getHref(), label: '設定', icon: Settings, activeStroke: 2 },
  ] as const;

  return (
    <nav aria-label="Primary" className="app-bottom-nav">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = currentPath === item.href;

        return (
          <Link
            aria-current={isActive ? 'page' : undefined}
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
