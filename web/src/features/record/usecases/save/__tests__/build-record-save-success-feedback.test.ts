/* 【責務】
 * buildRecordSaveSuccessFeedback の振る舞いを検証する。
 */

import { describe, expect, it } from 'vitest';

import { buildRecordSaveSuccessFeedback } from '../build-record-save-success-feedback';

describe('buildRecordSaveSuccessFeedback', () => {
  it('保存成功メッセージを返す', () => {
    expect(buildRecordSaveSuccessFeedback()).toEqual({
      message: '履歴に保存しました。',
      tone: 'info',
    });
  });
});
