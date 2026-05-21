/**
 * 【責務】
 * Record 画面遷移中に共通バーと背景シェルだけを描画する。
 */

import type { JSX } from 'react';

import { AppTopBar } from '@/components/app-top-bar';

export default function Loading(): JSX.Element {
  return (
    <div className="record-screen">
      <AppTopBar />
      <main className="record-screen__main record-screen__main--focused" style={{ opacity: 1 }} />
    </div>
  );
}
