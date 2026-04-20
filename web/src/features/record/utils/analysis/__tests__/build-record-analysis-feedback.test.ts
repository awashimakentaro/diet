/* 【責務】
 * buildRecordAnalysisFeedback の振る舞いを検証する。
 */

import { describe, expect, it } from 'vitest';

import { buildRecordAnalysisFeedback } from '../build-record-analysis-feedback';

describe('buildRecordAnalysisFeedback', () => {
  it('warning がある時は error feedback を返す', () => {
    const input = {
      warning: '候補が不完全です',
      analysisMode: 'replace' as const,
      hasAttachments: false,
    };
    const result = buildRecordAnalysisFeedback(input);

    expect(result).toEqual({
      message: '候補が不完全です',
      tone: 'error',
    });
  });

  it('append 時は既存カードへ追加した旨を返す', () => {
    const input = {
      warning: null,
      analysisMode: 'append' as const,
      hasAttachments: false,
    };
    const result = buildRecordAnalysisFeedback(input);

    expect(result).toEqual({
      message: 'AI が推定した食品候補を既存カードへ追加しました。',
      tone: 'info',
    });
  });

  it('写真あり replace 時は写真由来のメッセージを返す', () => {
    const input = {
      warning: null,
      analysisMode: 'replace' as const,
      hasAttachments: true,
    };
    const result = buildRecordAnalysisFeedback(input);

    expect(result).toEqual({
      message: 'AI が写真から推定した栄養情報を下書きカードへ反映しました。',
      tone: 'info',
    });
  });
});
