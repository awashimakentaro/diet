/* 【責務】
 * Record の保存成功後に採用する次状態を決定する。
 */

import { buildRecordSaveSuccessFeedback } from './build-record-save-success-feedback';

export function buildRecordSaveSuccessState(): {
  nextDraftOriginalText: '';
  nextWorkspaceMode: 'idle';
  feedback: {
    message: string;
    tone: 'info';
  };
} {
  return {
    nextDraftOriginalText: '',
    nextWorkspaceMode: 'idle',
    feedback: buildRecordSaveSuccessFeedback(),
  };
}
