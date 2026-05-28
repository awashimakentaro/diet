/* 【責務】
 * Home 画面の目標進捗と消費カロリー概要カードを描画する。
 */

import type { JSX } from 'react';

import type { HomeGoalOverview } from '../utils/build-home-goal-overview';

type HomeGoalOverviewCardProps = {
  overview: HomeGoalOverview;
};

function formatAdjustment(value: number): string {
  if (value > 0) {
    return `+${Math.round(value)} kcal`;
  }

  return `${Math.round(value)} kcal`;
}

export function HomeGoalOverviewCard({
  overview,
}: HomeGoalOverviewCardProps): JSX.Element {
  const bodyGoalItems = [
    {
      label: '現在 → 目標',
      value: `${overview.currentWeightKg}kg → ${overview.targetWeightKg}kg`,
    },
    {
      label: '目標日数',
      value: `${overview.targetDays}日`,
    },
  ] as const;
  const calculatedItems = [
    {
      label: '基礎代謝',
      value: `${Math.round(overview.bmr)} kcal`,
    },
    {
      label: '推定1日消費',
      value: `${Math.round(overview.estimatedDailyBurnKcal)} kcal`,
    },
    {
      label: '1日調整',
      value: formatAdjustment(overview.dailyCalorieAdjustment),
    },
    {
      label: '目標総摂取カロリー',
      value: `${Math.round(overview.calculatedTargetIntakeKcal)} kcal`,
    },
  ] as const;
  const trackingItems = [
    {
      label: '食事で摂りたいカロリー',
      value: `${Math.round(overview.targetIntakeKcal)} kcal`,
    },
    {
      label: '運動消費',
      value: `${Math.round(overview.workoutKcal)} kcal`,
    },
  ] as const;

  return (
    <section className="home-screen__card home-screen__goal-card">
      <div className="home-screen__card-head">
        <p className="home-screen__eyebrow">Goal Overview</p>
        <h2 className="home-screen__section-title">目標と今日の消費</h2>
      </div>

      {overview.isProfileReady ? (
        <div className="home-screen__goal-groups">
          <div className="home-screen__goal-group">
            <p>身体・期間</p>
            <div className="home-screen__goal-metric-list">
              {bodyGoalItems.map((item) => (
                <article className="home-screen__goal-metric" key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </article>
              ))}
            </div>
          </div>

          <div className="home-screen__goal-group home-screen__goal-group--calculated">
            <p>体重目標から逆算された理論値</p>
            <div className="home-screen__goal-metric-list">
              {calculatedItems.map((item) => (
                <article className="home-screen__goal-metric" key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </article>
              ))}
            </div>
          </div>

          <div className="home-screen__goal-group home-screen__goal-group--tracking">
            <p>毎日の記録で使う値</p>
            <div className="home-screen__goal-metric-list">
              {trackingItems.map((item) => (
                <article className="home-screen__goal-metric" key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </article>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <p className="home-screen__support-copy">
          Settings で現在体重、目標体重、目標達成日数、活動レベルを保存すると、目標達成に必要な1日の調整量を表示します。
        </p>
      )}
    </section>
  );
}
