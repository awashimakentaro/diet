/* 【責務】
 * buildNextRecordOriginalText の振る舞いを検証する。
 */

import { describe, expect, it } from 'vitest';

import { buildNextRecordOriginalText } from '../build-next-record-original-text';

describe('buildNextRecordOriginalText', () => {
  it('append かつ既存 originalText がある時は改行で追記する', () => {
    expect(
      buildNextRecordOriginalText({
        currentOriginalText: '朝: 卵',
        prompt: '  味噌汁  ',
        analysisMode: 'append',
      }),
    ).toBe('朝: 卵\n味噌汁');
  });

  it('append でも prompt が空なら既存 originalText を保持する', () => {
    expect(
      buildNextRecordOriginalText({
        currentOriginalText: '朝: 卵',
        prompt: '   ',
        analysisMode: 'append',
      }),
    ).toBe('朝: 卵');
  });

  it('replace 時は trim した prompt を返す', () => {
    expect(
      buildNextRecordOriginalText({
        currentOriginalText: '旧データ',
        prompt: '  新しい入力  ',
        analysisMode: 'replace',
      }),
    ).toBe('新しい入力');
  });
});
