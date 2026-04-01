'use client';

/**
 * web/src/app/app/settings/_components/settings-page-screen.tsx
 *
 * 【責務】
 * `/app/settings` ルート専用のトップバー、設定カード群、下部ナビを組み立てる。
 *
 * 【使用されるエージェント / 処理フロー】
 * - web/src/app/app/settings/page.tsx から呼ばれる。
 * - web/src/features/settings/use-settings-screen.ts の状態を受け取り、各設定カードへ渡す。
 *
 * 【やらないこと】
 * - 設定値の永続化
 * - 認証状態の保持
 * - 共通 UI の定義
 *
 * 【他ファイルとの関係】
 * - web/src/features/settings/components 配下を利用する。
 * - web/src/components/app-top-bar.tsx と app-bottom-nav.tsx を利用する。
 */

import { motion, useReducedMotion } from 'framer-motion';
import { type JSX } from 'react';
import { useRouter } from 'next/navigation';

import { AppBottomNav } from '@/components/app-bottom-nav';
import { AppTopBar } from '@/components/app-top-bar';
import { paths } from '@/config/paths';
import { SettingsAccountCard } from '@/features/settings/components/settings-account-card';
import { SettingsManualTargetCard } from '@/features/settings/components/settings-manual-target-card';
import { SettingsProfileCard } from '@/features/settings/components/settings-profile-card';
import { useSettingsScreen } from '@/features/settings/use-settings-screen';

export function SettingsPageScreen(): JSX.Element {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const {
    manualTargets,
    profileValues,
    gender,
    activityLevel,
    accountEmail,
    isSaving,
    isSigningOut,
    activeSaveAction,
    saveStatus,
    handleManualTargetChange,
    handleProfileValueChange,
    handleGenderChange,
    handleActivityChange,
    handleManualTargetSubmit,
    handleSaveProfile,
    handleRunAutoCalculate,
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
                isSaved={activeSaveAction === 'manual-goal' && saveStatus === 'success'}
                isSaving={activeSaveAction === 'manual-goal' && isSaving}
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
                isSavedAuto={activeSaveAction === 'auto-goal' && saveStatus === 'success'}
                isSavedProfile={activeSaveAction === 'profile' && saveStatus === 'success'}
                isSavingAuto={activeSaveAction === 'auto-goal' && isSaving}
                isSavingProfile={activeSaveAction === 'profile' && isSaving}
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
              <SettingsAccountCard
                email={accountEmail}
                isSigningOut={isSigningOut}
                onOpenTutorial={() => router.push(paths.home.getHref())}
                onSignOut={handleSignOut}
              />
            </motion.div>
          </motion.div>
        </div>
      </motion.main>

      <AppBottomNav currentPath="/app/settings" />
    </div>
  );
}
