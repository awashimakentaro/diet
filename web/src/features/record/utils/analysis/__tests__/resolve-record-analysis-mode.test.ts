/* 【責務】
 * resolveRecordAnalysisMode の振る舞いを検証する。
 */

import { describe, expect, it } from 'vitest';

import { resolveRecordAnalysisMode } from '../resolve-record-analysis-mode';

describe('resolveRecordAnalysisMode', () => {
  it('idle では常に replace を返す', () => {
    expect(
      resolveRecordAnalysisMode({
        workspaceMode: 'idle',
        mealName: '朝食',
        items: [{ name: '卵' }],
      }),
    ).toBe('replace');
  });

  it('manual で mealName があれば append を返す', () => {
    expect(
      resolveRecordAnalysisMode({
        workspaceMode: 'manual',
        mealName: '朝食',
        items: [{ name: '' }],
      }),
    ).toBe('append');
  });

  it('generated で item 名があれば append を返す', () => {
    expect(
      resolveRecordAnalysisMode({
        workspaceMode: 'generated',
        mealName: '',
        items: [{ name: 'ごはん' }],
      }),
    ).toBe('append');
  });

  it('manual でも意味のある下書きがなければ replace を返す', () => {
    expect(
      resolveRecordAnalysisMode({
        workspaceMode: 'manual',
        mealName: '',
        items: [{ name: '' }],
      }),
    ).toBe('replace');
  });
});
