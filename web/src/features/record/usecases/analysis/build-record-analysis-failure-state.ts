/* 【責務】
 * Record の解析失敗後に採用する次状態を決定する。
 */

import { buildRecordAnalysisErrorFeedback } from './build-record-analysis-error-feedback';
import { buildRecordAnalysisFallback } from './build-record-analysis-fallback';

type BuildRecordAnalysisFailureStateParams = {
  error: unknown;
  prompt: string;
  currentMealName: string;
  currentFirstItemName: string;
  currentOriginalText: string;
};

export function buildRecordAnalysisFailureState({
  error,
  prompt,
  currentMealName,
  currentFirstItemName,
  currentOriginalText,
}: BuildRecordAnalysisFailureStateParams): {
  fallback: {
    nextMealName: string | null;
    nextFirstItemName: string | null;
    nextOriginalText: string;
  };
  nextWorkspaceMode: 'generated';
  feedback: {
    message: string;
    tone: 'error';
  };
} {
  return {
    fallback: buildRecordAnalysisFallback({
      prompt,
      currentMealName,
      currentFirstItemName,
      currentOriginalText,
    }),
    nextWorkspaceMode: 'generated',
    feedback: buildRecordAnalysisErrorFeedback(error),
  };
}
