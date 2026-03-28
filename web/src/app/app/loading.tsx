/**
 * web/src/app/app/loading.tsx
 *
 * 【責務】
 * `/app/*` 共通の遷移中ローディングを中立なシェルとして描画する。
 *
 * 【使用されるエージェント / 処理フロー】
 * - `/app/*` 配下の親 loading fallback として自動表示される。
 * - どの子ルートでも違和感が出ない共通骨格だけを表示する。
 *
 * 【やらないこと】
 * - データ取得
 * - 認証制御
 * - 各画面固有の skeleton 表示
 *
 * 【他ファイルとの関係】
 * - web/src/components/app-top-bar.tsx と app-bottom-nav.tsx を利用する。
 * - web/src/components/app-skeleton.tsx の SkeletonCard / SkeletonLine を利用する。
 */

import type { JSX } from 'react';

import { AppBottomNav } from '@/components/app-bottom-nav';
import { SkeletonCard, SkeletonLine } from '@/components/app-skeleton';
import { AppTopBar } from '@/components/app-top-bar';

export default function Loading(): JSX.Element {
  return (
    <div className="home-screen">
      <AppTopBar />
      <main className="home-screen__main" style={{ opacity: 1 }}>
        <div className="skeleton-screen">
          <SkeletonCard className="skeleton-card--large">
            <SkeletonLine width="22%" height="11px" />
            <SkeletonLine width="34%" height="28px" style={{ marginTop: 10 }} />
            <SkeletonLine width="88%" height="12px" style={{ marginTop: 18 }} />
            <SkeletonLine width="72%" height="12px" style={{ marginTop: 8 }} />
          </SkeletonCard>

          <SkeletonCard>
            <SkeletonLine width="28%" height="10px" />
            <SkeletonLine width="44%" height="18px" style={{ marginTop: 8 }} />
            <SkeletonLine width="100%" height="180px" borderRadius="24px" style={{ marginTop: 18 }} />
          </SkeletonCard>
        </div>
      </main>
      <AppBottomNav currentPath="/app" />
    </div>
  );
}
