/**
 * features/settings/settings-screen.tsx
 *
 * 【責務】
 * 設定タブの画面を構築し、各セクションコンポーネントへ状態とイベントを渡す。
 *
 * 【使用箇所】
 * - app/(tabs)/settings.tsx
 *
 * 【やらないこと】
 * - GoalAgent / NotificationAgent のロジック実装
 *
 * 【他ファイルとの関係】
 * - 各セクションコンポーネントの UI を束ねる。
 */

import type { JSX } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ManualGoalSection } from './components/manual-goal-section';
import { AutoGoalSection } from './components/auto-goal-section';
import { NotificationSection } from './components/notification-section';
import { AccountSection } from './components/account-section';
import { SettingsHeader } from './components/settings-header';
import { useSettingsScreen } from './use-settings-screen';

/**
 * 設定タブ画面を描画する。
 * 呼び出し元: app/(tabs)/settings.tsx。
 * @returns JSX.Element
 * @remarks 副作用は子コンポーネント内のイベント処理に委譲する。
 */
export function SettingsScreen(): JSX.Element {
  const {
    manualForm,
    updateManualField,
    handleManualSave,
    profileForm,
    updateProfileField,
    handleProfileSave,
    handleCalculate,
    notificationsEnabled,
    selectedTimes,
    handleToggleNotification,
    toggleNotificationTime,
    handleSaveNotification,
    notificationPreviewBody,
    accountEmail,
    handleSignOut,
  } = useSettingsScreen();

  return (
    <SafeAreaView style={styles.safeArea}>
      <SettingsHeader />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
        <ManualGoalSection form={manualForm} onChangeField={updateManualField} onSubmit={handleManualSave} />
        <AutoGoalSection
          form={profileForm}
          onChangeField={updateProfileField}
          onSaveProfile={handleProfileSave}
          onCalculate={handleCalculate}
        />
        <NotificationSection
          enabled={notificationsEnabled}
          selectedTimes={selectedTimes}
          onToggleEnabled={handleToggleNotification}
          onToggleTime={toggleNotificationTime}
          onSave={handleSaveNotification}
          previewBody={notificationPreviewBody}
        />
        <AccountSection email={accountEmail} onSignOut={handleSignOut} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scroll: {
    backgroundColor: '#f9fafb',
  },
  container: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 120,
  },
});
