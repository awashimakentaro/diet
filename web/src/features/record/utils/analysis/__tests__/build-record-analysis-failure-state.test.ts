/* 【責務】
 * buildRecordAnalysisFailureState の振る舞いを検証する。
 */

import { describe, expect, it } from 'vitest';

import { buildRecordAnalysisFailureState } from '../build-record-analysis-failure-state';

describe('buildRecordAnalysisFailureState', () => {
  it('fallback と generated 遷移と error feedback を返す', () => {
    const input = {
      error: new Error('解析に失敗'),
      prompt: '鮭定食 味噌汁',
      currentMealName: '',
      currentFirstItemName: '',
      currentOriginalText: '',
    };
    const result = buildRecordAnalysisFailureState(input);

    expect(result.nextWorkspaceMode).toBe('generated');
    expect(result.feedback).toEqual({
      message: '解析に失敗',
      tone: 'error',
    });
    expect(result.fallback).toEqual({
      nextMealName: '鮭定食 味噌汁',
      nextFirstItemName: '鮭定食',
      nextOriginalText: '鮭定食 味噌汁',
    });
  });
});
