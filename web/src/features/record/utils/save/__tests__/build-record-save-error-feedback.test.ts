/* 【責務】
 * buildRecordSaveErrorFeedback の振る舞いを検証する。
 */

import { describe, expect, it } from 'vitest';

import { buildRecordSaveErrorFeedback } from '../build-record-save-error-feedback';

describe('buildRecordSaveErrorFeedback', () => {
  it('Error の message を優先する', () => {
    const error = new Error('保存失敗');
    const result = buildRecordSaveErrorFeedback(error);

    expect(result).toEqual({
      message: '保存失敗',
      tone: 'error',
    });
  });

  it('Error 以外なら既定メッセージを返す', () => {
    const result = buildRecordSaveErrorFeedback('unknown');

    expect(result).toEqual({
      message: '履歴へ保存できませんでした。',
      tone: 'error',
    });
  });
});
