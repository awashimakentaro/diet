'use client';

/**
 * web/src/app/app/(home)/_components/home-page-screen.tsx
 *
 * 【責務】
 * `/app` Home ルート専用のトップバー、サマリー、体重推移、下部ナビを組み立てる。
 *
 * 【使用されるエージェント / 処理フロー】
 * - web/src/app/app/(home)/page.tsx から呼ばれる。
 * - web/src/features/home/use-home-screen.ts の状態を受け取り、各表示領域へ渡す。
 *
 * 【やらないこと】
 * - API 通信
 * - 永続化
 * - 認証制御
 *
 * 【他ファイルとの関係】
 * - web/src/components/app-top-bar.tsx と app-bottom-nav.tsx を利用する。
 * - web/src/features/record/components/record-summary-card.tsx を Home 用に再利用する。
 * - web/src/features/home/components/weight-trend-chart.tsx を利用する。
 */

import { motion, useReducedMotion } from 'framer-motion';
import { useState, type JSX } from 'react';

import { HomeScreenSkeleton } from '@/components/app-skeleton';
import { AppTopBar } from '@/components/app-top-bar';
import { WeightTrendChart } from '@/features/home/components/weight-trend-chart';
import { useHomeScreen } from '@/features/home/use-home-screen';
import { RecordSummaryCard } from '@/components/record-summary-card';

export function HomePageScreen(): JSX.Element {
  const { summary, consecutiveDays, insights, usageBars, weightLogs, isLoading } = useHomeScreen();
  const [selectedWeightLogId, setSelectedWeightLogId] = useState<string | null>(null);
  const chartHeight = 136;
  const reduceMotion = useReducedMotion();
  const sectionTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.55, ease: 'easeOut' as const };

  return (
    <div className="home-screen">
      <AppTopBar />

      {isLoading ? (
        <main className="home-screen__main" style={{ opacity: 1 }}>
          <HomeScreenSkeleton />
        </main>
      ) : (
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
            <div className="home-screen__hero-stack">
              <RecordSummaryCard summary={summary} />

              <motion.section
                animate={{ opacity: 1, y: 0 }}
                className="home-screen__card"
                initial={{ opacity: 0, y: 20 }}
                transition={{ ...sectionTransition, delay: reduceMotion ? 0 : 0.16 }}
              >
                <div className="home-screen__card-head">
                  <p className="home-screen__eyebrow">インサイト</p>
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
            </div>

            <div className="home-screen__side-stack">
              <motion.section
                animate={{ opacity: 1, y: 0 }}
                className="home-screen__card home-screen__card--weight"
                initial={{ opacity: 0, y: 20 }}
                transition={{ ...sectionTransition, delay: reduceMotion ? 0 : 0.08 }}
              >
                <div className="home-screen__card-head">
                  <p className="home-screen__eyebrow">Body Progress</p>
                  <h2 className="home-screen__section-title">体重推移</h2>
                </div>

                <div className="home-screen__weight-summary">
                  <div>
                    <span>最新体重</span>
                    <strong>{weightLogs.at(-1)?.currentWeightKg ?? '--'} kg</strong>
                  </div>
                  <div>
                    <span>目標体重</span>
                    <strong>{weightLogs.at(-1)?.targetWeightKg ?? '--'} kg</strong>
                  </div>
                  {weightLogs.length > 0 ? (
                    <div className="home-screen__weight-summary-slot">
                      <WeightTrendChart
                        onSelectPoint={setSelectedWeightLogId}
                        points={weightLogs}
                        selectedPointId={selectedWeightLogId ?? weightLogs.at(-1)?.id ?? null}
                        variant="callout"
                      />
                    </div>
                  ) : null}
                </div>

                <WeightTrendChart
                  onSelectPoint={setSelectedWeightLogId}
                  points={weightLogs}
                  selectedPointId={selectedWeightLogId ?? weightLogs.at(-1)?.id ?? null}
                />
              </motion.section>

              <div className="home-screen__side-row">
                <motion.section
                  animate={{ opacity: 1, y: 0 }}
                  className="home-screen__card"
                  initial={{ opacity: 0, y: 20 }}
                  transition={{ ...sectionTransition, delay: reduceMotion ? 0 : 0.16 }}
                >
                  <div className="home-screen__card-head">
                    <p className="home-screen__eyebrow">コンスタンス</p>
                    <h2 className="home-screen__section-title">継続利用</h2>
                  </div>

                  <div className="home-screen__streak">
                    <strong>{consecutiveDays}</strong>
                    <span>日間連続</span>
                  </div>

                  <p className="home-screen__support-copy">
                    連続して記録できています。今日も入力を続けて、日々の推移を安定して残しましょう。
                  </p>
                </motion.section>

                <motion.section
                  animate={{ opacity: 1, y: 0 }}
                  className="home-screen__card"
                  initial={{ opacity: 0, y: 20 }}
                  transition={{ ...sectionTransition, delay: reduceMotion ? 0 : 0.2 }}
                >
                  <div className="home-screen__card-head">
                    <p className="home-screen__eyebrow">アクティビティ</p>
                    <h2 className="home-screen__section-title">曜日ごとの摂取カロリー</h2>
                  </div>

                  <p className="home-screen__activity-copy">
                    今週の各曜日でどれだけ摂取したかを kcal ベースで表示しています。
                  </p>

                  <div className="home-screen__usage-chart">
                    {usageBars.map((bar) => (
                      <div className="home-screen__usage-bar" key={bar.label}>
                        <strong className="home-screen__usage-kcal">
                          {bar.hasRecord ? `${bar.kcal} kcal` : '-'}
                        </strong>
                        <motion.div
                          animate={{
                            height: bar.hasRecord
                              ? Math.max(8, Math.round((bar.value / 100) * chartHeight))
                              : 0,
                          }}
                          className={bar.hasRecord ? 'home-screen__usage-fill' : 'home-screen__usage-fill home-screen__usage-fill--empty'}
                          initial={{ height: 0 }}
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
                </motion.section>
              </div>
            </div>
          </motion.section>
        </motion.main>
      )}
    </div>
  );
}
