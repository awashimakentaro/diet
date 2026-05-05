/* 【責務】
 * `/app/workouts` の筋トレ画面入口として画面コンポーネントを呼び出す。
 */

import type { JSX } from 'react';

import { WorkoutsPageScreen } from './_components/workouts-page-screen';

export default function WorkoutsPage(): JSX.Element {
  return <WorkoutsPageScreen />;
}
