/**
 * web/src/features/settings/components/settings-notification-card.tsx
 *
 * 【責務】
 * 通知設定カードを描画する。
 *
 * 【使用されるエージェント / 処理フロー】
 * - settings-screen.tsx から呼ばれる。
 * - トグル状態、時間帯、保存ハンドラを受け取る。
 *
 * 【やらないこと】
 * - 永続化
 * - 認証操作
 * - 自動計算
 *
 * 【他ファイルとの関係】
 * - use-settings-screen.ts の通知 state に依存する。
 */

import type { JSX } from 'react';

type ReminderSlot = 'morning' | 'noon' | 'evening' | 'night';

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
      <p className="settings-screen__section-label">通知設定</p>

      <div className="settings-screen__card settings-screen__card--notification">
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

        <button className="settings-screen__primary-button" onClick={onSave} type="button">
          通知設定を保存
        </button>
      </div>
    </section>
  );
}
