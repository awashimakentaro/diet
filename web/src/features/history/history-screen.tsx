'use client';

/**
 * web/src/features/history/history-screen.tsx
 *
 * 【責務】
 * History 画面全体のトップバー、日付チップ、履歴一覧、下部ナビを組み立てる。
 *
 * 【使用されるエージェント / 処理フロー】
 * - web/src/app/app/history/page.tsx から呼ばれる。
 * - use-history-screen.ts と各 UI コンポーネントを接続する。
 *
 * 【やらないこと】
 * - API 通信
 * - 永続化
 * - 認証制御
 *
 * 【他ファイルとの関係】
 * - components/history-* と app-bottom-nav.tsx を利用する。
 */

import type { JSX } from 'react';

import { AppBottomNav } from '@/components/app-bottom-nav';
import { AppTopBar } from '@/components/app-top-bar';

import { HistoryDateChip } from './components/history-date-chip';
import { HistoryEntryCard } from './components/history-entry-card';
import { useHistoryScreen } from './use-history-screen';

export function HistoryScreen(): JSX.Element {
  const {
    meals,
    selectedDateLabel,
    feedbackMessage,
    handleDeleteMeal,
    handleSaveMeal,
  } = useHistoryScreen();

  return (
    <div className="history-screen">
      <AppTopBar />

      <main className="history-screen__main">
        <HistoryDateChip selectedDateLabel={selectedDateLabel} />

        {feedbackMessage !== null ? (
          <p className="history-screen__feedback">{feedbackMessage}</p>
        ) : null}

        <section className="history-screen__list">
          {meals.map((meal) => (
            <HistoryEntryCard
              key={meal.id}
              meal={meal}
              onDelete={handleDeleteMeal}
              onSave={handleSaveMeal}
            />
          ))}
        </section>
      </main>

      <AppBottomNav currentPath="/app/history" />
    </div>
  );
}
