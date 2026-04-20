/* 【責務】
 * resolveRecordAnalysisMode の振る舞いを検証する。
 */

import { describe, expect, it } from 'vitest';

import { resolveRecordAnalysisMode } from '../resolve-record-analysis-mode';

describe('resolveRecordAnalysisMode', () => {
  it('idle では常に replace を返す', () => {
    const input = {
      workspaceMode: 'idle' as const,
      mealName: '朝食',
      items: [{ name: '卵' }],
    };
    const result = resolveRecordAnalysisMode(input);

    expect(result).toBe('replace');
  });

  it('manual で mealName があれば append を返す', () => {
    const input = {
      workspaceMode: 'manual' as const,
      mealName: '朝食',
      items: [{ name: '' }],
    };
    const result = resolveRecordAnalysisMode(input);

    expect(result).toBe('append');
  });

  it('generated で item 名があれば append を返す', () => {
    const input = {
      workspaceMode: 'generated' as const,
      mealName: '',
      items: [{ name: 'ごはん' }],
    };
    const result = resolveRecordAnalysisMode(input);

    expect(result).toBe('append');
  });

  it('manual でも意味のある下書きがなければ replace を返す', () => {
    const input = {
      workspaceMode: 'manual' as const,
      mealName: '',
      items: [{ name: '' }],
    };
    const result = resolveRecordAnalysisMode(input);

    expect(result).toBe('replace');
  });
});
