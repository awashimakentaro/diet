'use client';

/**
 * web/src/features/home/home-screen.tsx
 *
 * 【責務】
 * Home 画面全体のトップバー、Nutrition Status、分析サマリー、下部ナビを組み立てる。
 *
 * 【使用されるエージェント / 処理フロー】
 * - web/src/app/app/page.tsx から呼ばれる。
 * - use-home-screen.ts の状態を受け取り、各表示領域へ渡す。
 *
 * 【やらないこと】
 * - API 通信
 * - 永続化
 * - 認証制御
 *
 * 【他ファイルとの関係】
 * - AppTopBar と AppBottomNav を利用する。
 * - RecordSummaryCard を Home 用の Nutrition Status として再利用する。
 */

import type { JSX } from 'react';

import { AppBottomNav } from '@/components/app-bottom-nav';
import { AppTopBar } from '@/components/app-top-bar';
import { RecordSummaryCard } from '@/features/record/components/record-summary-card';

import { useHomeScreen } from './use-home-screen';

export function HomeScreen(): JSX.Element {
  const { summary, consecutiveDays, insights, usageBars, recentMeals } = useHomeScreen();

  return (
    <div className="home-screen">
      <AppTopBar />

      <main className="home-screen__main">
        <section className="home-screen__hero-grid">
          <RecordSummaryCard summary={summary} />

          <section className="home-screen__card">
            <div className="home-screen__card-head">
              <p className="home-screen__eyebrow">Consistency</p>
              <h2 className="home-screen__section-title">継続利用</h2>
            </div>

            <div className="home-screen__streak">
              <strong>{consecutiveDays}</strong>
              <span>days streak</span>
            </div>

            <p className="home-screen__support-copy">
              連続して記録できています。今日も入力を続けて、日々の推移を安定して残しましょう。
            </p>
          </section>
        </section>

        <section className="home-screen__grid">
          <section className="home-screen__card">
            <div className="home-screen__card-head">
              <p className="home-screen__eyebrow">Insights</p>
              <h2 className="home-screen__section-title">分析結果</h2>
            </div>

            <div className="home-screen__insight-list">
              {insights.map((insight) => (
                <article className="home-screen__insight-card" key={insight.label}>
                  <p>{insight.label}</p>
                  <strong>{insight.value}</strong>
                  <span>{insight.description}</span>
                </article>
              ))}
            </div>
          </section>

          <section className="home-screen__card">
            <div className="home-screen__card-head">
              <p className="home-screen__eyebrow">Activity</p>
              <h2 className="home-screen__section-title">最近の利用状況</h2>
            </div>

            <div className="home-screen__usage-chart">
              {usageBars.map((bar) => (
                <div className="home-screen__usage-bar" key={bar.label}>
                  <div
                    className="home-screen__usage-fill"
                    style={{ height: `${bar.value}%` }}
                  />
                  <span>{bar.label}</span>
                </div>
              ))}
            </div>

            <div className="home-screen__recent-list">
              {recentMeals.map((meal) => (
                <article className="home-screen__recent-item" key={meal.id}>
                  <div>
                    <strong>{meal.name}</strong>
                    <p>{meal.time}</p>
                  </div>
                  <span>{meal.kcal} kcal</span>
                </article>
              ))}
            </div>
          </section>
        </section>
      </main>

      <AppBottomNav currentPath="/app" />
    </div>
  );
}
