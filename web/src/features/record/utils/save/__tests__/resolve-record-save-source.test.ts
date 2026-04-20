/* 【責務】
 * resolveRecordSaveSource の振る舞いを検証する。
 */

import { describe, expect, it } from 'vitest';

import { resolveRecordSaveSource } from '../resolve-record-save-source';

describe('resolveRecordSaveSource', () => {
  it('generated は text を返す', () => {
    const result = resolveRecordSaveSource('generated');

    expect(result).toBe('text');
  });

  it('generated 以外は manual を返す', () => {
    const manualResult = resolveRecordSaveSource('manual');
    const idleResult = resolveRecordSaveSource('idle');

    expect(manualResult).toBe('manual');
    expect(idleResult).toBe('manual');
  });
});
