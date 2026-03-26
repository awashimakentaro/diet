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

import { motion, useReducedMotion } from 'framer-motion';
import type { JSX } from 'react';

import { AppBottomNav } from '@/components/app-bottom-nav';
import { AppTopBar } from '@/components/app-top-bar';

import { SettingsAccountCard } from './components/settings-account-card';
import { SettingsManualTargetCard } from './components/settings-manual-target-card';
import { SettingsNotificationCard } from './components/settings-notification-card';
import { SettingsProfileCard } from './components/settings-profile-card';
import { useSettingsScreen } from './use-settings-screen';

export function SettingsScreen(): JSX.Element {
  const reduceMotion = useReducedMotion();
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
  const sectionTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.45, ease: 'easeOut' as const };

  return (
    <div className="settings-screen">
      <AppTopBar />

      <motion.main
        animate={{ opacity: 1, y: 0 }}
        className="settings-screen__main"
        initial={{ opacity: 0, y: 18 }}
        transition={sectionTransition}
      >
        <div className="settings-screen__grid">
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="settings-screen__primary-column"
            initial={{ opacity: 0, y: 20 }}
            transition={{ ...sectionTransition, delay: reduceMotion ? 0 : 0.06 }}
          >
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 14 }}
              transition={{ ...sectionTransition, delay: reduceMotion ? 0 : 0.1 }}
            >
              <SettingsManualTargetCard
                onChange={handleManualTargetChange}
                onSubmit={handleManualTargetSubmit}
                values={manualTargets}
              />
            </motion.div>

            <motion.div
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 14 }}
              transition={{ ...sectionTransition, delay: reduceMotion ? 0 : 0.14 }}
            >
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
            </motion.div>
          </motion.div>

          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="settings-screen__secondary-column"
            initial={{ opacity: 0, y: 20 }}
            transition={{ ...sectionTransition, delay: reduceMotion ? 0 : 0.1 }}
          >
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 14 }}
              transition={{ ...sectionTransition, delay: reduceMotion ? 0 : 0.14 }}
            >
              <SettingsNotificationCard
                enabled={notificationsEnabled}
                onSave={handleSaveNotifications}
                onSelectReminder={handleReminderSelect}
                onToggleEnabled={handleToggleNotifications}
                selectedReminder={selectedReminder}
              />
            </motion.div>

            <motion.div
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 14 }}
              transition={{ ...sectionTransition, delay: reduceMotion ? 0 : 0.18 }}
            >
              <SettingsAccountCard email={accountEmail} onSignOut={handleSignOut} />
            </motion.div>

            {feedbackMessage !== null ? (
              <p className="settings-screen__feedback">{feedbackMessage}</p>
            ) : null}
          </motion.div>
        </div>
      </motion.main>

      <AppBottomNav currentPath="/app/settings" />
    </div>
  );
}
