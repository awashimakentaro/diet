'use client';

/*
 * 【責務】
 * `/app` Home ルート専用のトップバー、サマリー、体重推移、下部ナビを組み立てる。
 */

import { motion, useReducedMotion } from 'framer-motion';
import { Camera, Dumbbell } from 'lucide-react';
import Link from 'next/link';
import { useState, type JSX } from 'react';

import { HomeScreenSkeleton } from '@/components/app-skeleton';
import { AppTopBar } from '@/components/app-top-bar';
import { WeightTrendChart } from '@/features/home/components/weight-trend-chart';
import { DailyEnergyCard } from '@/features/home/components/daily-energy-card';
import { useHomeScreen } from '@/features/home/use-home-screen';
import { RecordSummaryCard } from '@/components/record-summary-card';
import { paths } from '@/config/paths';

export function HomePageScreen(): JSX.Element {
  const { summary, dailyEnergy, weightLogs, isLoading } = useHomeScreen();
  const [selectedWeightLogId, setSelectedWeightLogId] = useState<string | null>(null);
  const hasTodayRecord = summary.kcal > 0 || summary.macros.some((macro) => macro.current > 0);
  const hasWeightLogs = weightLogs.length > 0;
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
              <section className="home-screen__action-card">
                <div>
                  <p className="home-screen__eyebrow">Quick Start</p>
                  <h2>写真で記録する。</h2>
                  <span>{hasTodayRecord ? '今日の続きも、写真か一言で足せます。' : 'まずは今日の食事を1つ残すところから。'}</span>
                </div>
                <Link className="home-screen__record-link" href={paths.app.record.getHref()}>
                  <Camera aria-hidden="true" size={19} strokeWidth={2.5} />
                  記録する
                </Link>
              </section>

              {!hasTodayRecord ? (
                <section className="home-screen__empty-card" aria-label="今日の記録がない状態">
                  <strong>今日の記録はまだありません</strong>
                  <span>写真を追加すると AI が候補を作ります。細かい PFC は後から直せます。</span>
                </section>
              ) : null}

              <RecordSummaryCard summary={summary} />
              <DailyEnergyCard
                balanceKcal={dailyEnergy.balanceKcal}
                bmr={dailyEnergy.bmr}
                intakeKcal={dailyEnergy.intakeKcal}
                isProfileReady={dailyEnergy.isProfileReady}
                workoutKcal={dailyEnergy.workoutKcal}
              />
            </div>

            <div className="home-screen__side-stack">
              <section className="home-screen__gym-card" aria-label="PFC Tracker のコンセプト">
                <Dumbbell aria-hidden="true" size={28} strokeWidth={2.4} />
                <strong>NO MORE</strong>
                <span>面倒な食事管理。</span>
              </section>

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
                  {hasWeightLogs ? (
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

                {hasWeightLogs ? (
                  <WeightTrendChart
                    onSelectPoint={setSelectedWeightLogId}
                    points={weightLogs}
                    selectedPointId={selectedWeightLogId ?? weightLogs.at(-1)?.id ?? null}
                  />
                ) : (
                  <div className="home-screen__weight-empty home-screen__weight-empty--action">
                    <p>設定で現在体重と目標体重を保存すると、ここに推移が表示されます。</p>
                    <Link className="home-screen__record-link home-screen__record-link--ghost" href={paths.app.settings.getHref()}>
                      設定を開く
                    </Link>
                  </div>
                )}
              </motion.section>
            </div>
          </motion.section>
        </motion.main>
      )}
    </div>
  );
}
