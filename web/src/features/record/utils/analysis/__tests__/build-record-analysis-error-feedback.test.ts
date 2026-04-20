/* 【責務】
 * buildRecordAnalysisErrorFeedback の振る舞いを検証する。
 */

import { describe, expect, it } from 'vitest';

import { buildRecordAnalysisErrorFeedback } from '../build-record-analysis-error-feedback';

describe('buildRecordAnalysisErrorFeedback', () => {
  it('Error の message を優先する', () => {
    const error = new Error('解析API失敗');
    const result = buildRecordAnalysisErrorFeedback(error);

    expect(result).toEqual({
      message: '解析API失敗',
      tone: 'error',
    });
  });

  it('Error 以外なら既定メッセージを返す', () => {
    const result = buildRecordAnalysisErrorFeedback('unknown');

    expect(result).toEqual({
      message: '解析に失敗したため、簡易的な下書きを表示しています。',
      tone: 'error',
    });
  });
});
