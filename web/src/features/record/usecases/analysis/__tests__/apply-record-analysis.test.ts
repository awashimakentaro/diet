/* 【責務】
 * applyRecordAnalysisToForm の振る舞いを検証する。
 */

import { describe, expect, it, vi } from 'vitest';

import { applyRecordAnalysisToForm } from '../apply-record-analysis';

describe('applyRecordAnalysisToForm', () => {
  it('replace 時は mealName と prompt を更新して items を置換する', () => {
    const setValue = vi.fn();
    const replaceItems = vi.fn();
    const form = {
      setValue,
      getValues: vi.fn().mockReturnValue('既存名'),
    } as never;

    applyRecordAnalysisToForm({
      form,
      replaceItems,
      currentItems: [],
      draft: {
        menuName: '朝食',
        originalText: '卵',
        items: [
          { name: '卵', amount: '1個', kcal: 80.4, protein: 6.2, fat: 5.1, carbs: 0.2 },
        ],
        warnings: [],
        source: 'text',
      },
      mode: 'replace',
    });

    expect(setValue).toHaveBeenCalledWith('mealName', '朝食', { shouldDirty: true });
    expect(setValue).toHaveBeenCalledWith('prompt', '', { shouldDirty: true });
    expect(replaceItems).toHaveBeenCalledWith([
      { name: '卵', amount: '1個', kcal: '80.4', protein: '6.2', fat: '5.1', carbs: '0.2' },
    ]);
  });

  it('append 時は既存 mealName が空なら解析結果の mealName を入れて items を追記する', () => {
    const setValue = vi.fn();
    const replaceItems = vi.fn();
    const form = {
      setValue,
      getValues: vi.fn().mockReturnValue(''),
    } as never;

    applyRecordAnalysisToForm({
      form,
      replaceItems,
      currentItems: [
        { name: 'ごはん', amount: '100g', kcal: '156', protein: '2.5', fat: '0.3', carbs: '35.6' },
      ],
      draft: {
        menuName: '昼食',
        originalText: '味噌汁',
        items: [
          { name: '味噌汁', amount: '1杯', kcal: 40, protein: 2.5, fat: 1.2, carbs: 4.8 },
        ],
        warnings: [],
        source: 'text',
      },
      mode: 'append',
    });

    expect(setValue).toHaveBeenCalledWith('mealName', '昼食', { shouldDirty: true });
    expect(setValue).toHaveBeenCalledWith('prompt', '', { shouldDirty: true });
    expect(replaceItems).toHaveBeenCalledWith([
      { name: 'ごはん', amount: '100g', kcal: '156', protein: '2.5', fat: '0.3', carbs: '35.6' },
      { name: '味噌汁', amount: '1杯', kcal: '40', protein: '2.5', fat: '1.2', carbs: '4.8' },
    ]);
  });

  it('append 時は既存 mealName があれば mealName を上書きしない', () => {
    const setValue = vi.fn();
    const replaceItems = vi.fn();
    const form = {
      setValue,
      getValues: vi.fn().mockReturnValue('既存ランチ'),
    } as never;

    applyRecordAnalysisToForm({
      form,
      replaceItems,
      currentItems: [],
      draft: {
        menuName: '昼食',
        originalText: 'サラダ',
        items: [
          { name: 'サラダ', amount: '1皿', kcal: 30, protein: 1.5, fat: 0.2, carbs: 6.1 },
        ],
        warnings: [],
        source: 'text',
      },
      mode: 'append',
    });

    expect(setValue).not.toHaveBeenCalledWith('mealName', '昼食', { shouldDirty: true });
    expect(setValue).toHaveBeenCalledWith('prompt', '', { shouldDirty: true });
  });
});
