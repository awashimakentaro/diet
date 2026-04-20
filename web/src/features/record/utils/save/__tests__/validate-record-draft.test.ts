/* 【責務】
 * validateRecordDraft の振る舞いを検証する。
 */

import { describe, expect, it } from 'vitest';

import { validateRecordDraft } from '../validate-record-draft';

describe('validateRecordDraft', () => {
  it('mealName も item 名も空なら error を返す', () => {
    const draft = {
      mealName: '   ',
      items: [{ name: '   ' }],
    } as never;
    const result = validateRecordDraft(draft);

    expect(result).toEqual({
      ok: false,
      error: '食事名または食品カードを入力してください。',
    });
  });

  it('mealName があれば成功する', () => {
    const draft = {
      mealName: '朝食',
      items: [{ name: '   ' }],
    } as never;
    const result = validateRecordDraft(draft);

    expect(result).toEqual({ ok: true });
  });

  it('item 名があれば成功する', () => {
    const draft = {
      mealName: '   ',
      items: [{ name: '卵' }],
    } as never;
    const result = validateRecordDraft(draft);

    expect(result).toEqual({ ok: true });
  });
});
