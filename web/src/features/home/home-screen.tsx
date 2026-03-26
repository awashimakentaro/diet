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
import { motion, useReducedMotion } from 'framer-motion';

import { AppBottomNav } from '@/components/app-bottom-nav';
import { AppTopBar } from '@/components/app-top-bar';
import { RecordSummaryCard } from '@/features/record/components/record-summary-card';

import { useHomeScreen } from './use-home-screen';

export function HomeScreen(): JSX.Element {
  const { summary, consecutiveDays, insights, usageBars, recentMeals } = useHomeScreen();
  const chartHeight = 136;
  const reduceMotion = useReducedMotion();
  const sectionTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.55, ease: 'easeOut' as const };

  return (
    <div className="home-screen">
      <AppTopBar />

      <motion.main
        animate={{ opacity: 1, y: 0 }}
        className="home-screen__main"
        initial={{ opacity: 0, y: 14 }}
        transition={sectionTransition}
      >
        <motion.section
          animate={{ opacity: 1, y: 0 }}
          className="home-screen__hero-grid"
          initial={{ opacity: 0, y: 18 }}
          transition={sectionTransition}
        >
          <RecordSummaryCard summary={summary} />

          <motion.section
            animate={{ opacity: 1, y: 0 }}
            className="home-screen__card"
            initial={{ opacity: 0, y: 20 }}
            transition={{ ...sectionTransition, delay: reduceMotion ? 0 : 0.08 }}
          >
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
          </motion.section>
        </motion.section>

        <motion.section
          animate={{ opacity: 1, y: 0 }}
          className="home-screen__grid"
          initial={{ opacity: 0, y: 18 }}
          transition={{ ...sectionTransition, delay: reduceMotion ? 0 : 0.12 }}
        >
          <motion.section
            animate={{ opacity: 1, y: 0 }}
            className="home-screen__card"
            initial={{ opacity: 0, y: 20 }}
            transition={{ ...sectionTransition, delay: reduceMotion ? 0 : 0.16 }}
          >
            <div className="home-screen__card-head">
              <p className="home-screen__eyebrow">Insights</p>
              <h2 className="home-screen__section-title">分析結果</h2>
            </div>

            <div className="home-screen__insight-list">
              {insights.map((insight) => (
                <motion.article
                  animate={{ opacity: 1, y: 0 }}
                  className="home-screen__insight-card"
                  initial={{ opacity: 0, y: 14 }}
                  key={insight.label}
                  transition={{ ...sectionTransition, delay: reduceMotion ? 0 : 0.22 }}
                >
                  <div className="home-screen__insight-label-row">
                    <p>{insight.label}</p>
                    <span className="home-screen__insight-dot" />
                  </div>
                  <strong>{insight.value}</strong>
                  <span>{insight.description}</span>
                </motion.article>
              ))}
            </div>
          </motion.section>

          <motion.section
            animate={{ opacity: 1, y: 0 }}
            className="home-screen__card"
            initial={{ opacity: 0, y: 20 }}
            transition={{ ...sectionTransition, delay: reduceMotion ? 0 : 0.2 }}
          >
            <div className="home-screen__card-head">
              <p className="home-screen__eyebrow">Activity</p>
              <h2 className="home-screen__section-title">最近の利用状況</h2>
            </div>

            <div className="home-screen__usage-chart">
              {usageBars.map((bar) => (
                <div className="home-screen__usage-bar" key={bar.label}>
                  <motion.div
                    className={bar.hasRecord ? 'home-screen__usage-fill' : 'home-screen__usage-fill home-screen__usage-fill--empty'}
                    initial={{ height: 0 }}
                    animate={{
                      height: bar.hasRecord
                        ? Math.max(8, Math.round((bar.value / 100) * chartHeight))
                        : 0,
                    }}
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : { duration: 0.8, ease: 'easeOut' as const }
                    }
                  />
                  <span>{bar.label}</span>
                </div>
              ))}
            </div>

            <div className="home-screen__recent-list">
              {recentMeals.map((meal) => (
                <motion.article
                  animate={{ opacity: 1, y: 0 }}
                  className="home-screen__recent-item"
                  initial={{ opacity: 0, y: 12 }}
                  key={meal.id}
                  transition={{ ...sectionTransition, delay: reduceMotion ? 0 : 0.26 }}
                >
                  <div>
                    <strong>{meal.name}</strong>
                    <p>{meal.time}</p>
                  </div>
                  <span>{meal.kcal} kcal</span>
                </motion.article>
              ))}
            </div>
          </motion.section>
        </motion.section>
      </motion.main>

      <AppBottomNav currentPath="/app" />
    </div>
  );
}
