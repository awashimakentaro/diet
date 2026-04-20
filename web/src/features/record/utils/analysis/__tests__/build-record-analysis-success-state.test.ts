/* 【責務】
 * buildRecordAnalysisSuccessState の振る舞いを検証する。
 */

import { describe, expect, it } from 'vitest';

import { buildRecordAnalysisSuccessState } from '../build-record-analysis-success-state';

describe('buildRecordAnalysisSuccessState', () => {
  it('idle かつ空下書きなら replace を返す', () => {
    const input = {
      warning: null,
      hasAttachments: false,
      workspaceMode: 'idle' as const,
      mealName: '',
      items: [{ name: '', amount: '', kcal: '', protein: '', fat: '', carbs: '' }],
      prompt: 'オムレツ',
      currentOriginalText: '',
    };
    const result = buildRecordAnalysisSuccessState(input);

    expect(result).toEqual({
      analysisMode: 'replace',
      nextOriginalText: 'オムレツ',
      nextWorkspaceMode: 'generated',
      feedback: {
        message: 'AI が推定した栄養情報を下書きカードへ反映しました。',
        tone: 'info',
      },
    });
  });

  it('manual で有効な下書きがあれば append を返す', () => {
    const input = {
      warning: null,
      hasAttachments: false,
      workspaceMode: 'manual' as const,
      mealName: '昼食',
      items: [{ name: 'ごはん', amount: '100g', kcal: '156', protein: '2.5', fat: '0.3', carbs: '35.6' }],
      prompt: '味噌汁',
      currentOriginalText: 'ごはん',
    };
    const result = buildRecordAnalysisSuccessState(input);

    expect(result.analysisMode).toBe('append');
    expect(result.nextOriginalText).toBe('ごはん\n味噌汁');
    expect(result.feedback).toEqual({
      message: 'AI が推定した食品候補を既存カードへ追加しました。',
      tone: 'info',
    });
  });
});
