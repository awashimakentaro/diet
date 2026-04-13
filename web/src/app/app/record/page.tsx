/* 【責務】
 * `/app/record` ルートのページ shell を描画する。
 */

import type { JSX } from 'react';

import { RecordRouteScreen } from './_components/record';

export default function RecordPage(): JSX.Element {
  return <RecordRouteScreen />;
}
