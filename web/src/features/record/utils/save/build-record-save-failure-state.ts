/* 【責務】
 * Record の保存失敗後に採用する次状態を決定する。
 */

import { buildRecordSaveErrorFeedback } from './build-record-save-error-feedback';

export function buildRecordSaveFailureState(error: unknown): {
  feedback: {
    message: string;
    tone: 'error';
  };
} {
  return {
    feedback: buildRecordSaveErrorFeedback(error),
  };
}
