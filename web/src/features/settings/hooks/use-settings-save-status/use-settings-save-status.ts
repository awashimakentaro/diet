'use client';

/* 【責務】
 * Settings 画面の保存状態を管理する。
 */

import { useState } from 'react';

import type { SettingsSaveAction, SettingsSaveStatus } from '../../types';

export type UseSettingsSaveStatusResult = {
  isSaving: boolean;
  activeSaveAction: SettingsSaveAction;
  saveStatus: SettingsSaveStatus;
  runSaveAction: (action: Exclude<SettingsSaveAction, null>, callback: () => Promise<void>) => Promise<void>;
  markSaveError: (action: Exclude<SettingsSaveAction, null>) => void;
};

export function useSettingsSaveStatus(): UseSettingsSaveStatusResult {
  const [isSaving, setIsSaving] = useState(false);
  const [activeSaveAction, setActiveSaveAction] = useState<SettingsSaveAction>(null);
  const [saveStatus, setSaveStatus] = useState<SettingsSaveStatus>('idle');

  async function runSaveAction(
    action: Exclude<SettingsSaveAction, null>,
    callback: () => Promise<void>,
  ): Promise<void> {
    try {
      setActiveSaveAction(action);
      setIsSaving(true);
      setSaveStatus('saving');
      await callback();
      setSaveStatus('success');
    } catch {
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  }

  function markSaveError(action: Exclude<SettingsSaveAction, null>): void {
    setActiveSaveAction(action);
    setSaveStatus('error');
  }

  return {
    isSaving,
    activeSaveAction,
    saveStatus,
    runSaveAction,
    markSaveError,
  };
}
