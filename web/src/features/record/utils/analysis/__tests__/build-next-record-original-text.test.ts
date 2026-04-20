/* 【責務】
 * buildNextRecordOriginalText の振る舞いを検証する。
 */

import { describe, expect, it } from 'vitest';

import { buildNextRecordOriginalText } from '../build-next-record-original-text';

describe('buildNextRecordOriginalText', () => {
  it('append かつ既存 originalText がある時は改行で追記する', () => {
    const input = {
      currentOriginalText: '朝: 卵',
      prompt: '  味噌汁  ',
      analysisMode: 'append' as const,
    };
    const result = buildNextRecordOriginalText(input);

    expect(result).toBe('朝: 卵\n味噌汁');
  });

  it('append でも prompt が空なら既存 originalText を保持する', () => {
    const input = {
      currentOriginalText: '朝: 卵',
      prompt: '   ',
      analysisMode: 'append' as const,
    };
    const result = buildNextRecordOriginalText(input);

    expect(result).toBe('朝: 卵');
  });

  it('replace 時は trim した prompt を返す', () => {
    const input = {
      currentOriginalText: '旧データ',
      prompt: '  新しい入力  ',
      analysisMode: 'replace' as const,
    };
    const result = buildNextRecordOriginalText(input);

    expect(result).toBe('新しい入力');
  });
});
