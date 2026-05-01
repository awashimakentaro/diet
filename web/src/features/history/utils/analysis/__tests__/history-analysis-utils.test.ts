/* 【責務】
 * History 解析 utility の振る舞いを検証する。
 */

import { describe, expect, it } from 'vitest';

import { buildHistoryAnalysisEmptyFeedback } from '../build-history-analysis-empty-feedback';
import { buildHistoryAnalysisErrorFeedback } from '../build-history-analysis-error-feedback';
import { buildHistoryAnalysisFeedback } from '../build-history-analysis-feedback';
import { buildHistoryAnalysisItems } from '../build-history-analysis-items';
import { validateHistoryMealAnalysisInput } from '../validate-history-meal-analysis-input';

describe('history analysis utils', () => {
  it('解析結果を編集フォーム item に変換する', () => {
    expect(
      buildHistoryAnalysisItems({
        menuName: '朝食',
        originalText: '卵',
        warnings: [],
        source: 'text',
        items: [
          {
            name: '卵',
            amount: '1個',
            kcal: 80,
            protein: 6,
            fat: 5,
            carbs: 0,
          },
        ],
      }),
    ).toEqual([
      {
        name: '卵',
        amount: '1個',
        kcal: '80',
        protein: '6',
        fat: '5',
        carbs: '0',
      },
    ]);
  });

  it('解析入力を検証する', () => {
    expect(validateHistoryMealAnalysisInput({ prompt: '   ' })).toEqual({
      ok: false,
      message: '追加したい食品を入力してください。',
    });
    expect(validateHistoryMealAnalysisInput({ prompt: '卵' })).toEqual({ ok: true });
  });

  it('解析 feedback を生成する', () => {
    expect(buildHistoryAnalysisEmptyFeedback()).toEqual({
      message: '食品候補を追加できませんでした。',
      tone: 'error',
    });
    expect(buildHistoryAnalysisErrorFeedback(new Error('解析失敗'))).toEqual({
      message: '解析失敗',
      tone: 'error',
    });
    expect(buildHistoryAnalysisFeedback({ warning: null, itemCount: 2 })).toEqual({
      message: '2件の食品候補を追加しました。',
      tone: 'info',
    });
    expect(buildHistoryAnalysisFeedback({ warning: '注意', itemCount: 2 })).toEqual({
      message: '注意',
      tone: 'error',
    });
  });
});
