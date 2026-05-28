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
  targetIntakeKcal: number;
  requiredDailyGapKcal: number;
  direction: 'deficit' | 'surplus' | 'maintain';
  isProfileReady: boolean;
};

function formatKcal(value: number): string {
  return `${Math.round(Math.abs(value)).toLocaleString('ja-JP')} kcal`;
}

function buildFoodProgressCopy(intakeKcal: number, targetIntakeKcal: number): string {
  const remainingKcal = targetIntakeKcal - intakeKcal;

  if (remainingKcal > 0) {
    return `あと ${formatKcal(remainingKcal)} 摂取できます`;
  }

  if (remainingKcal < 0) {
    return `食事目標を ${formatKcal(remainingKcal)} 超過しています`;
  }

  return '食事目標にぴったり届いています';
}

function buildBalanceCopy(balanceKcal: number, requiredDailyGapKcal: number, direction: DailyEnergyCardProps['direction']): string {
  if (direction === 'deficit') {
    const actualDeficit = Math.max(0, -balanceKcal);
    const diff = actualDeficit - requiredDailyGapKcal;

    if (Math.abs(diff) < 50) {
      return `今日は赤字 ${formatKcal(requiredDailyGapKcal)} 目標に近いです`;
    }

    return diff > 0
      ? `目標より ${formatKcal(diff)} 赤字が大きいです`
      : `目標より ${formatKcal(diff)} 赤字が不足しています`;
  }

  if (direction === 'surplus') {
    return `今日は黒字 ${formatKcal(requiredDailyGapKcal)} 目標です`;
  }

  return '今日は維持カロリー基準で確認しています';
}

export function DailyEnergyCard({
  intakeKcal,
  bmr,
  workoutKcal,
  balanceKcal,
  targetIntakeKcal,
  requiredDailyGapKcal,
  direction,
  isProfileReady,
}: DailyEnergyCardProps): JSX.Element {
  const foodProgressCopy = buildFoodProgressCopy(intakeKcal, targetIntakeKcal);
  const balanceCopy = buildBalanceCopy(balanceKcal, requiredDailyGapKcal, direction);

  return (
    <section className="home-screen__card home-screen__energy-card">
      <div className="home-screen__card-head">
        <p className="home-screen__eyebrow">Daily Balance</p>
        <h2 className="home-screen__section-title">今日の収支</h2>
      </div>

      <div className="home-screen__energy-message">
        <span>{foodProgressCopy}</span>
        {isProfileReady ? <strong>{balanceCopy}</strong> : null}
      </div>

      <div className="home-screen__energy-total">
        <Flame size={22} strokeWidth={2.4} />
        <strong>{Math.round(balanceKcal)} kcal</strong>
      </div>

      <div className="home-screen__energy-breakdown">
        <span>摂取 {Math.round(intakeKcal)} kcal</span>
        <span>基礎代謝 {Math.round(bmr)} kcal</span>
        <span>運動 {Math.round(workoutKcal)} kcal</span>
      </div>

      {!isProfileReady ? (
        <p className="home-screen__support-copy">
          プロフィールの体格情報を保存すると、基礎代謝を反映します。
        </p>
      ) : null}
    </section>
  );
}
