/* 【責務】
 * buildRecordAnalysisFallback の振る舞いを検証する。
 */

import { describe, expect, it } from 'vitest';

import { buildRecordAnalysisFallback } from '../build-record-analysis-fallback';

describe('buildRecordAnalysisFallback', () => {
  it('mealName と firstItemName が空なら prompt から補完する', () => {
    expect(
      buildRecordAnalysisFallback({
        prompt: '納豆 ごはん 味噌汁',
        currentMealName: '',
        currentFirstItemName: '',
        currentOriginalText: '',
      }),
    ).toEqual({
      nextMealName: '納豆 ごはん 味噌汁',
      nextFirstItemName: '納豆',
      nextOriginalText: '納豆 ごはん 味噌汁',
    });
  });

  it('mealName と firstItemName が既にあるなら補完しない', () => {
    expect(
      buildRecordAnalysisFallback({
        prompt: '納豆 ごはん 味噌汁',
        currentMealName: '朝食',
        currentFirstItemName: '卵',
        currentOriginalText: '既存',
      }),
    ).toEqual({
      nextMealName: null,
      nextFirstItemName: null,
      nextOriginalText: '既存\n納豆 ごはん 味噌汁',
    });
  });

  it('mealName は18文字を超えると省略する', () => {
    const result = buildRecordAnalysisFallback({
      prompt: 'とても長い料理名で十八文字を超えるサンプルです',
      currentMealName: '',
      currentFirstItemName: '',
      currentOriginalText: '',
    });

    expect(result.nextMealName).toBe('とても長い料理名で十八文字を超えるサ…');
  });
});
