/* 【責務】
 * Settings 画面の通知設定カードを描画する。
 */

import type { JSX } from 'react';

import type { ReminderSlot } from '../../types';

type SettingsNotificationCardProps = {
  enabled: boolean;
  selectedReminder: ReminderSlot;
  onToggleEnabled: () => void;
  onSelectReminder: (value: ReminderSlot) => void;
  onSave: () => void;
};

const REMINDER_OPTIONS = [
  { value: 'morning', label: '朝', time: '09:00' },
  { value: 'noon', label: '昼', time: '13:00' },
  { value: 'evening', label: '夕', time: '19:00' },
  { value: 'night', label: '夜', time: '22:00' },
] as const;

export function SettingsNotificationCard({
  enabled,
  selectedReminder,
  onToggleEnabled,
  onSelectReminder,
  onSave,
}: SettingsNotificationCardProps): JSX.Element {
  return (
    <section className="settings-screen__section">
      <div className="settings-screen__section-head">
        <p className="eyebrow">通知設定</p>
        <span>このカードの保存ボタンは通知の有効状態と時間帯だけを更新します。</span>
      </div>


      <div className="settings-screen__card settings-screen__card--notification app-card">
        <div className="settings-screen__toggle-row">
          <span>スマート過不足通知</span>
          <button
            aria-pressed={enabled}
            className={enabled ? 'settings-screen__switch settings-screen__switch--on' : 'settings-screen__switch'}
            onClick={onToggleEnabled}
            type="button"
          >
            <i />
          </button>
        </div>

        <div className="settings-screen__reminder-grid">
          {REMINDER_OPTIONS.map((option) => (
            <button
              className={selectedReminder === option.value ? 'settings-screen__reminder-button settings-screen__reminder-button--active' : 'settings-screen__reminder-button'}
              key={option.value}
              onClick={() => onSelectReminder(option.value)}
              type="button"
            >
              <strong>{option.label}</strong>
              <span>{option.time}</span>
            </button>
          ))}
        </div>

        <button className="app-btn app-btn--primary" onClick={onSave} type="button">
          通知設定を保存
        </button>

      </div>
    </section>
  );
}
