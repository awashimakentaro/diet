/* 【責務】
 * useRecordScreenFeedback の振る舞いを検証する。
 */

import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useRecordScreenFeedback } from '../use-record-screen-feedback';

describe('useRecordScreenFeedback', () => {
  it('setFeedback で message と tone を更新できる', () => {
    const { result } = renderHook(() => useRecordScreenFeedback());

    act(() => {
      result.current.setFeedback({
        message: '保存成功',
        tone: 'info',
      });
    });

    expect(result.current.feedbackMessage).toBe('保存成功');
    expect(result.current.feedbackTone).toBe('info');
  });

  it('resetFeedback で初期状態へ戻る', () => {
    const { result } = renderHook(() => useRecordScreenFeedback());

    act(() => {
      result.current.setFeedback({
        message: '保存失敗',
        tone: 'error',
      });
      result.current.resetFeedback();
    });

    expect(result.current.feedbackMessage).toBeNull();
    expect(result.current.feedbackTone).toBe('info');
  });
});
