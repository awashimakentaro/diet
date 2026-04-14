/* 【責務】
 * Record 画面のフィードバック表示状態を管理する。
 */

'use client';

import { useState } from 'react';

type RecordFeedbackTone = 'info' | 'error';

type UseRecordScreenFeedbackResult = {
  feedbackMessage: string | null;
  feedbackTone: RecordFeedbackTone;
  setFeedback: (feedback: { message: string | null; tone: RecordFeedbackTone }) => void;
  resetFeedback: () => void;
};

export function useRecordScreenFeedback(): UseRecordScreenFeedbackResult {
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [feedbackTone, setFeedbackTone] = useState<RecordFeedbackTone>('info');

  function setFeedback({
    message,
    tone,
  }: {
    message: string | null;
    tone: RecordFeedbackTone;
  }): void {
    setFeedbackMessage(message);
    setFeedbackTone(tone);
  }

  function resetFeedback(): void {
    setFeedback({
      message: null,
      tone: 'info',
    });
  }

  return {
    feedbackMessage,
    feedbackTone,
    setFeedback,
    resetFeedback,
  };
}
