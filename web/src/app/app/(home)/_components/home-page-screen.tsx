'use client';

/*
 * 【責務】
 * `/app` Home ルート専用のトップバー、栄養状況、今日のワークアウト、カロリー収支を組み立てる。
 */

import { motion, useReducedMotion } from 'framer-motion';
import { Camera } from 'lucide-react';
import Link from 'next/link';
import { type JSX } from 'react';

import { AppTopBar } from '@/components/app-top-bar';
import { DailyEnergyCard } from '@/features/home/components/daily-energy-card';
import { useHomeScreen } from '@/features/home/use-home-screen';
import { TodayWorkoutLogList } from '@/features/workouts/components/today-workout-log-list';
import { RecordSummaryCard } from '@/components/record-summary-card';
import { paths } from '@/config/paths';

export function HomePageScreen(): JSX.Element {
  const { summary, dailyEnergy, todayWorkoutLogs, todayWorkoutBurnedKcal } = useHomeScreen();
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
            <RecordSummaryCard
              action={(
                <Link className="home-screen__record-link" href={paths.app.record.getHref()}>
                  <Camera aria-hidden="true" size={19} strokeWidth={2.5} />
                  記録する
                </Link>
              )}
              summary={summary}
            />
            <div className="home-screen__side-stack">
              <TodayWorkoutLogList
                activeLogId={null}
                burnedKcal={todayWorkoutBurnedKcal}
                logs={todayWorkoutLogs}
                onDeleteLog={() => undefined}
                showLogs={false}
              />
              <DailyEnergyCard
                balanceKcal={dailyEnergy.balanceKcal}
                bmr={dailyEnergy.bmr}
                intakeKcal={dailyEnergy.intakeKcal}
                isProfileReady={dailyEnergy.isProfileReady}
                workoutKcal={dailyEnergy.workoutKcal}
              />
            </div>
          </motion.section>
      </motion.main>
    </div>
  );
}
