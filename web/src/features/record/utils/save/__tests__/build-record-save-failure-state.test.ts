/* 【責務】
 * buildRecordSaveFailureState の振る舞いを検証する。
 */

import { describe, expect, it } from 'vitest';

import { buildRecordSaveFailureState } from '../build-record-save-failure-state';

describe('buildRecordSaveFailureState', () => {
  it('保存失敗時の feedback を返す', () => {
    const error = new Error('保存失敗');
    const result = buildRecordSaveFailureState(error);

    expect(result).toEqual({
      feedback: {
        message: '保存失敗',
        tone: 'error',
      },
    });
  });
});
