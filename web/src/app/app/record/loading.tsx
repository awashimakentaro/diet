/**
 * 【責務】
 * Record 画面遷移中のスケルトン UI を描画する。
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
