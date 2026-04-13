/* 【責務】
 * `/app/record` ルートのページ shell を描画する。
 */

import type { JSX } from 'react';

import { AppBottomNav } from '@/components/app-bottom-nav';
import { AppTopBar } from '@/components/app-top-bar';
import { RecordScreen } from '@/features/record/components/record-screen';

export function RecordRouteScreen(): JSX.Element {
  return (
    <div className="record-screen">
      <AppTopBar />
      <RecordScreen />
      <AppBottomNav currentPath="/app/record" />
    </div>
  );
}
