'use client';

/**
 * web/src/features/settings/settings-screen.tsx
 *
 * 【責務】
 * Settings 画面全体のトップバー、各設定カード、下部ナビを組み立てる。
 *
 * 【使用されるエージェント / 処理フロー】
 * - web/src/app/app/settings/page.tsx から呼ばれる。
 * - use-settings-screen.ts と各 UI コンポーネントを接続する。
 *
 * 【やらないこと】
 * - API 通信
 * - 永続化
 * - 認証設定の実装変更
 *
 * 【他ファイルとの関係】
 * - components/settings-* と app-bottom-nav.tsx を利用する。
 */

import type { JSX } from 'react';

import { AppBottomNav } from '@/components/app-bottom-nav';
import { AppTopBar } from '@/components/app-top-bar';

import { SettingsAccountCard } from './components/settings-account-card';
import { SettingsManualTargetCard } from './components/settings-manual-target-card';
import { SettingsNotificationCard } from './components/settings-notification-card';
import { SettingsProfileCard } from './components/settings-profile-card';
import { useSettingsScreen } from './use-settings-screen';

export function SettingsScreen(): JSX.Element {
  const {
    manualTargets,
    profileValues,
    gender,
    activityLevel,
    notificationsEnabled,
    selectedReminder,
    accountEmail,
    feedbackMessage,
    handleManualTargetChange,
    handleProfileValueChange,
    handleGenderChange,
    handleActivityChange,
    handleToggleNotifications,
    handleReminderSelect,
    handleManualTargetSubmit,
    handleSaveProfile,
    handleRunAutoCalculate,
    handleSaveNotifications,
    handleSignOut,
  } = useSettingsScreen();

  return (
    <div className="settings-screen">
      <AppTopBar />

      <main className="settings-screen__main">
        <div className="settings-screen__grid">
          <div className="settings-screen__primary-column">
            <SettingsManualTargetCard
              onChange={handleManualTargetChange}
              onSubmit={handleManualTargetSubmit}
              values={manualTargets}
            />

            <SettingsProfileCard
              activityLevel={activityLevel}
              gender={gender}
              onActivityChange={handleActivityChange}
              onGenderChange={handleGenderChange}
              onRunAutoCalculate={handleRunAutoCalculate}
              onSaveProfile={handleSaveProfile}
              onValueChange={handleProfileValueChange}
              values={profileValues}
            />
          </div>

          <div className="settings-screen__secondary-column">
            <SettingsNotificationCard
              enabled={notificationsEnabled}
              onSave={handleSaveNotifications}
              onSelectReminder={handleReminderSelect}
              onToggleEnabled={handleToggleNotifications}
              selectedReminder={selectedReminder}
            />

            <SettingsAccountCard email={accountEmail} onSignOut={handleSignOut} />

            {feedbackMessage !== null ? (
              <p className="settings-screen__feedback">{feedbackMessage}</p>
            ) : null}
          </div>
        </div>
      </main>

      <AppBottomNav currentPath="/app/settings" />
    </div>
  );
}
