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
import { HomeGoalOverviewCard } from '@/features/home/components/home-goal-overview-card';
import { useHomeScreen } from '@/features/home/use-home-screen';
import { RecordSummaryCard } from '@/components/record-summary-card';
import { paths } from '@/config/paths';

export function HomePageScreen(): JSX.Element {
  const { summary, goalOverview } = useHomeScreen();
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
            <div className="home-screen__primary-stack">
              <RecordSummaryCard
                action={(
                  <Link className="home-screen__record-link" href={paths.app.record.getHref()}>
                    <Camera aria-hidden="true" size={19} strokeWidth={2.5} />
                    記録する
                  </Link>
                )}
                eyebrow="今日の食事進捗"
                showGoalKcal={false}
                summary={summary}
              />
              <DailyEnergyCard
                balanceKcal={goalOverview.balanceKcal}
                bmr={goalOverview.bmr}
                direction={goalOverview.direction}
                intakeKcal={goalOverview.intakeKcal}
                isProfileReady={goalOverview.isProfileReady}
                requiredDailyGapKcal={goalOverview.requiredDailyGapKcal}
                targetIntakeKcal={goalOverview.targetIntakeKcal}
                workoutKcal={goalOverview.workoutKcal}
              />
            </div>
            <div className="home-screen__side-stack">
              <HomeGoalOverviewCard overview={goalOverview} />
            </div>
          </motion.section>
      </motion.main>
    </div>
  );
}
