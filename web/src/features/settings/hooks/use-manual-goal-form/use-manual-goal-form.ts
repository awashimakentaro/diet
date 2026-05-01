'use client';

/* 【責務】
 * Settings 画面の手動目標フォームを管理する。
 */

import { useState } from 'react';

import { mockGoal } from '@/data/mock-diet-data';

import type { ManualTargetValues } from '../../types';

export type UseManualGoalFormResult = {
  manualTargets: ManualTargetValues;
  setManualTargets: (values: ManualTargetValues) => void;
  handleManualTargetChange: (field: keyof ManualTargetValues, value: string) => void;
};

export function useManualGoalForm(): UseManualGoalFormResult {
  const [manualTargets, setManualTargets] = useState<ManualTargetValues>({
    kcal: String(mockGoal.totals.kcal),
    protein: String(mockGoal.totals.protein),
    fat: String(mockGoal.totals.fat),
    carbs: String(mockGoal.totals.carbs),
  });

  function handleManualTargetChange(field: keyof ManualTargetValues, value: string): void {
    setManualTargets((current) => ({ ...current, [field]: value }));
  }

  return {
    manualTargets,
    setManualTargets,
    handleManualTargetChange,
  };
}
