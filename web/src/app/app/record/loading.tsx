/**
 * web/src/app/app/record/loading.tsx
 *
 * 【責務】
 * Record 画面遷移中のスケルトン UI を描画する。
 *
 * 【使用されるエージェント / 処理フロー】
 * - `/app/record` ルートの loading fallback として自動表示される。
 *
 * 【やらないこと】
 * - フォーム state 管理
 * - API 通信
 * - Record 本体ロジックの実行
 *
 * 【他ファイルとの関係】
 * - web/src/components/app-skeleton.tsx の RecordScreenSkeleton を利用する。
 * - web/src/components/app-top-bar.tsx と app-bottom-nav.tsx を利用する。
 */

import type { JSX } from 'react';

import { AppBottomNav } from '@/components/app-bottom-nav';
import { RecordScreenSkeleton } from '@/components/app-skeleton';
import { AppTopBar } from '@/components/app-top-bar';

export default function Loading(): JSX.Element {
  return (
    <div className="record-screen">
      <AppTopBar />
      <main className="record-screen__main record-screen__main--focused" style={{ opacity: 1 }}>
        <RecordScreenSkeleton />
      </main>
      <AppBottomNav currentPath="/app/record" />
    </div>
  );
}
