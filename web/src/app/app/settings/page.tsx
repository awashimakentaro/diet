/**
 * web/app/settings/page.tsx
 *
 * 【責務】
 * Web 版の設定画面として、目標値・自動計算条件・通知設定の表示を行う。
 *
 * 【使用箇所】
 * - `/app/settings` ルートで表示される。
 *
 * 【やらないこと】
 * - 目標保存
 * - 通知スケジュール登録
 * - バリデーション実装
 *
 * 【他ファイルとの関係】
 * - mockGoal, mockProfileSnapshot, mockNotificationSetting を表示し、モバイル Settings タブの骨格を踏襲する。
 */

import type { JSX } from 'react';

import { WebAppShell } from '@/components/web-app-shell';
import { WebSectionCard } from '@/components/web-section-card';
import { mockGoal, mockNotificationSetting, mockProfileSnapshot } from '@/data/mock-diet-data';
import { formatDateLabel, formatGram, formatKcal } from '@/lib/web-formatters';

/**
 * 設定画面を描画する。
 * 呼び出し元: Next.js `/app/settings` ルート。
 * @returns 設定画面 JSX
 * @remarks 副作用は存在しない。
 */
export default function SettingsPage(): JSX.Element {
  return (
    <WebAppShell currentPath="/app/settings">
      <WebSectionCard
        description="kcal / P / F / C の手動目標をモバイル版と同じ粒度で確認する。"
        eyebrow="設定"
        title="手動目標設定"
      >
        <div className="two-column-grid">
          <article className="soft-card">
            <p className="soft-card__label">Source</p>
            <h3>{mockGoal.source}</h3>
            <p>更新日: {formatDateLabel(mockGoal.updatedAt)}</p>
          </article>
          <article className="soft-card">
            <p className="soft-card__label">Targets</p>
            <div className="detail-stack">
              <span>{formatKcal(mockGoal.totals.kcal)}</span>
              <span>P {formatGram(mockGoal.totals.protein)}</span>
              <span>F {formatGram(mockGoal.totals.fat)}</span>
              <span>C {formatGram(mockGoal.totals.carbs)}</span>
            </div>
          </article>
        </div>
      </WebSectionCard>

      <WebSectionCard
        description="体格情報と活動量から目標値を自動計算するための入力群。"
        eyebrow="設定"
        title="自動計算"
      >
        <div className="three-column-grid">
          <article className="soft-card">
            <p className="soft-card__label">Profile</p>
            <p>性別: {mockProfileSnapshot.gender}</p>
            <p>年齢: {mockProfileSnapshot.age} 歳</p>
            <p>身長: {mockProfileSnapshot.heightCm} cm</p>
          </article>
          <article className="soft-card">
            <p className="soft-card__label">Weights</p>
            <p>現在: {mockProfileSnapshot.currentWeightKg} kg</p>
            <p>目標: {mockProfileSnapshot.targetWeightKg} kg</p>
            <p>期間: {mockProfileSnapshot.targetWeeks} 週</p>
          </article>
          <article className="soft-card">
            <p className="soft-card__label">Activity</p>
            <p>{mockProfileSnapshot.activityLevel}</p>
            <button className="primary-button" type="button">自動計算を反映</button>
          </article>
        </div>
      </WebSectionCard>

      <WebSectionCard
        description="0時の過不足通知を ON/OFF で管理する。"
        eyebrow="設定"
        title="通知"
      >
        <div className="two-column-grid">
          <article className="soft-card">
            <p className="soft-card__label">Status</p>
            <h3>{mockNotificationSetting.enabled ? 'ON' : 'OFF'}</h3>
            <p>{mockNotificationSetting.time} に通知</p>
          </article>
          <article className="soft-card">
            <p className="soft-card__label">Timezone</p>
            <h3>{mockNotificationSetting.timezone}</h3>
            <button className="secondary-button" type="button">通知を切り替える</button>
          </article>
        </div>
      </WebSectionCard>
    </WebAppShell>
  );
}
