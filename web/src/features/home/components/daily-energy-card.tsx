/* 【責務】
 * Home 画面の1日カロリー収支カードを描画する。
 */

import { Flame } from 'lucide-react';
import type { JSX } from 'react';

type DailyEnergyCardProps = {
  intakeKcal: number;
  bmr: number;
  workoutKcal: number;
  balanceKcal: number;
  isProfileReady: boolean;
};

export function DailyEnergyCard({
  intakeKcal,
  bmr,
  workoutKcal,
  balanceKcal,
  isProfileReady,
}: DailyEnergyCardProps): JSX.Element {
  return (
    <section className="home-screen__card home-screen__energy-card">
      <div className="home-screen__card-head">
        <p className="home-screen__eyebrow">Daily Balance</p>
        <h2 className="home-screen__section-title">1日のカロリー収支</h2>
      </div>

      <div className="home-screen__energy-total">
        <Flame size={22} strokeWidth={2.4} />
        <strong>{Math.round(balanceKcal)} kcal</strong>
      </div>

      <div className="home-screen__energy-breakdown">
        <span>摂取 {Math.round(intakeKcal)} kcal</span>
        <span>基礎代謝 {Math.round(bmr)} kcal</span>
        <span>筋トレ {Math.round(workoutKcal)} kcal</span>
      </div>

      {!isProfileReady ? (
        <p className="home-screen__support-copy">
          プロフィールの体格情報を保存すると、基礎代謝を反映します。
        </p>
      ) : null}
    </section>
  );
}
