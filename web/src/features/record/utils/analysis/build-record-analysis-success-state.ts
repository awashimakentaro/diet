/* 【責務】
 * Record の解析成功後に採用する次状態を決定する。
 */

import { buildNextRecordOriginalText } from './build-next-record-original-text';
import { buildRecordAnalysisFeedback } from './build-record-analysis-feedback';
import { resolveRecordAnalysisMode } from './resolve-record-analysis-mode';

type BuildRecordAnalysisSuccessStateParams = {
  warning: string | null;
  hasAttachments: boolean;
  workspaceMode: 'idle' | 'manual' | 'generated';
  mealName: string;
  items: {
    name: string;
    amount: string;
    kcal: string;
    protein: string;
    fat: string;
    carbs: string;
  }[];
  prompt: string;
  currentOriginalText: string;
};

export function buildRecordAnalysisSuccessState({
  warning,
  hasAttachments,
  workspaceMode,
  mealName,
  items,
  prompt,
  currentOriginalText,
}: BuildRecordAnalysisSuccessStateParams): {
  analysisMode: 'append' | 'replace';
  nextOriginalText: string;
  nextWorkspaceMode: 'generated';
  feedback: {
    message: string;
    tone: 'info' | 'error';
  };
} {
  const analysisMode = resolveRecordAnalysisMode({
    workspaceMode,
    mealName,
    items,
  });

  return {
    analysisMode,
    nextOriginalText: buildNextRecordOriginalText({
      currentOriginalText,
      prompt,
      analysisMode,
    }),
    nextWorkspaceMode: 'generated',
    feedback: buildRecordAnalysisFeedback({
      warning,
      analysisMode,
      hasAttachments,
    }),
  };
}
