/* 【責務】
 * resolveRecordSaveSource の振る舞いを検証する。
 */

import { describe, expect, it } from 'vitest';

import { resolveRecordSaveSource } from '../resolve-record-save-source';

describe('resolveRecordSaveSource', () => {
  it('generated は text を返す', () => {
    expect(resolveRecordSaveSource('generated')).toBe('text');
  });

  it('generated 以外は manual を返す', () => {
    expect(resolveRecordSaveSource('manual')).toBe('manual');
    expect(resolveRecordSaveSource('idle')).toBe('manual');
  });
});
