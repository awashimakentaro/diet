/* 【責務】
 * validateRecordDraft の振る舞いを検証する。
 */

import { describe, expect, it } from 'vitest';

import { validateRecordDraft } from '../validate-record-draft';

describe('validateRecordDraft', () => {
  it('mealName も item 名も空なら error を返す', () => {
    expect(
      validateRecordDraft({
        mealName: '   ',
        items: [{ name: '   ' }],
      } as never),
    ).toEqual({
      ok: false,
      error: '食事名または食品カードを入力してください。',
    });
  });

  it('mealName があれば成功する', () => {
    expect(
      validateRecordDraft({
        mealName: '朝食',
        items: [{ name: '   ' }],
      } as never),
    ).toEqual({ ok: true });
  });

  it('item 名があれば成功する', () => {
    expect(
      validateRecordDraft({
        mealName: '   ',
        items: [{ name: '卵' }],
      } as never),
    ).toEqual({ ok: true });
  });
});
