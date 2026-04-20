/* 【責務】
 * buildRecordSaveSuccessState の振る舞いを検証する。
 */

import { describe, expect, it } from 'vitest';

import { buildRecordSaveSuccessState } from '../build-record-save-success-state';

describe('buildRecordSaveSuccessState', () => {
  it('保存成功後に必要な次状態を返す', () => {
    const result = buildRecordSaveSuccessState();

    expect(result).toEqual({
      nextDraftOriginalText: '',
      nextWorkspaceMode: 'idle',
      feedback: {
        message: '履歴に保存しました。',
        tone: 'info',
      },
    });
  });
});
