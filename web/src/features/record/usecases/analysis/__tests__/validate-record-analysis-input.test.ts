/* 【責務】
 * validateRecordAnalysisInput の振る舞いを検証する。
 */

import { describe, expect, it } from 'vitest';

import { validateRecordAnalysisInput } from '../validate-record-analysis-input';

describe('validateRecordAnalysisInput', () => {
  it('prompt も attachment も無ければ error を返す', () => {
    expect(
      validateRecordAnalysisInput({
        prompt: '   ',
        hasAttachments: false,
      }),
    ).toEqual({
      ok: false,
      message: '食事内容または写真を追加すると、下の編集欄へ下書きを反映できます。',
    });
  });

  it('prompt があれば成功する', () => {
    expect(
      validateRecordAnalysisInput({
        prompt: '卵かけご飯',
        hasAttachments: false,
      }),
    ).toEqual({ ok: true });
  });

  it('attachment があれば成功する', () => {
    expect(
      validateRecordAnalysisInput({
        prompt: '   ',
        hasAttachments: true,
      }),
    ).toEqual({ ok: true });
  });
});
