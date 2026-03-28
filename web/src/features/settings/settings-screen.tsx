'use client';

/**
 * web/src/features/settings/settings-screen.tsx
 *
 * 【責務】
 * Settings 画面全体のトップバー、各設定カード、下部ナビを組み立てる。
 */

import { motion, useReducedMotion } from 'framer-motion';
import { type JSX } from 'react';
import { useRouter } from 'next/navigation';

import { AppBottomNav } from '@/components/app-bottom-nav';
import { AppTopBar } from '@/components/app-top-bar';
import { paths } from '@/config/paths';

import { SettingsAccountCard } from './components/settings-account-card';
import { SettingsManualTargetCard } from './components/settings-manual-target-card';
import { SettingsProfileCard } from './components/settings-profile-card';
import { useSettingsScreen } from './use-settings-screen';

export function SettingsScreen(): JSX.Element {
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
