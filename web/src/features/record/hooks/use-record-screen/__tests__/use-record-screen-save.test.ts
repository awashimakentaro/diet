/* 【責務】
 * useRecordScreenSave の振る舞いを検証する。
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useRecordScreenSave } from '../use-record-screen-save';

const saveRecordMealMock = vi.hoisted(() => vi.fn());
const buildRecordSaveFailureStateMock = vi.hoisted(() => vi.fn());
const buildRecordSaveSuccessStateMock = vi.hoisted(() => vi.fn());
const resetRecordDraftAfterSaveMock = vi.hoisted(() => vi.fn());

vi.mock('../../../api/save-record-meal', () => ({
  saveRecordMeal: saveRecordMealMock,
}));

vi.mock('../../../usecases/save/build-record-save-failure-state', () => ({
  buildRecordSaveFailureState: buildRecordSaveFailureStateMock,
}));

vi.mock('../../../usecases/save/build-record-save-success-state', () => ({
  buildRecordSaveSuccessState: buildRecordSaveSuccessStateMock,
}));

vi.mock('../../../utils/reset-record-draft-after-save', () => ({
  resetRecordDraftAfterSave: resetRecordDraftAfterSaveMock,
}));

describe('useRecordScreenSave', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('入力が無効なら error feedback を返して保存を開始しない', async () => {
    const setFeedback = vi.fn();
    const setIsSaving = vi.fn();

    const { handleConfirmDraft } = useRecordScreenSave({
      form: {
        getValues: vi.fn((name: string) => {
          if (name === 'recordedDate') return '2026-04-15';
          if (name === 'mealName') return '   ';
          if (name === 'items') return [{ name: '   ' }];
          return '';
        }),
      } as never,
      workspaceMode: 'manual',
      draftOriginalText: '',
      replaceItems: vi.fn(),
      setIsSaving,
      setDraftOriginalText: vi.fn(),
      setWorkspaceMode: vi.fn(),
      setFeedback,
    });

    await handleConfirmDraft();

    expect(setFeedback).toHaveBeenCalledWith({
      message: '食事名または食品カードを入力してください。',
      tone: 'error',
    });
    expect(setIsSaving).not.toHaveBeenCalled();
  });

  it('保存成功時は save 実行後に success state を反映する', async () => {
    const form = {
      getValues: vi.fn((name: string) => {
        if (name === 'recordedDate') return '2026-04-15';
        if (name === 'mealName') return '朝食';
        if (name === 'items') return [{ name: '卵' }];
        return '';
      }),
    } as never;
    const replaceItems = vi.fn();
    const setIsSaving = vi.fn();
    const setDraftOriginalText = vi.fn();
    const setWorkspaceMode = vi.fn();
    const setFeedback = vi.fn();

    saveRecordMealMock.mockResolvedValue(undefined);
    buildRecordSaveSuccessStateMock.mockReturnValue({
      nextDraftOriginalText: '',
      nextWorkspaceMode: 'idle',
      feedback: {
        message: '履歴に保存しました。',
        tone: 'info',
      },
    });

    const { handleConfirmDraft } = useRecordScreenSave({
      form,
      workspaceMode: 'generated',
      draftOriginalText: '卵',
      replaceItems,
      setIsSaving,
      setDraftOriginalText,
      setWorkspaceMode,
      setFeedback,
    });

    await handleConfirmDraft();

    expect(setIsSaving).toHaveBeenNthCalledWith(1, true);
    expect(saveRecordMealMock).toHaveBeenCalledWith({
      values: {
        recordedDate: '2026-04-15',
        mealName: '朝食',
        items: [{ name: '卵' }],
      },
      originalText: '卵',
      source: 'text',
    });
    expect(resetRecordDraftAfterSaveMock).toHaveBeenCalledWith({
      form,
      replaceItems,
    });
    expect(setDraftOriginalText).toHaveBeenCalledWith('');
    expect(setWorkspaceMode).toHaveBeenCalledWith('idle');
    expect(setFeedback).toHaveBeenCalledWith({
      message: '履歴に保存しました。',
      tone: 'info',
    });
    expect(setIsSaving).toHaveBeenLastCalledWith(false);
  });

  it('保存失敗時は failure state の feedback を反映する', async () => {
    const setFeedback = vi.fn();
    const setIsSaving = vi.fn();

    saveRecordMealMock.mockRejectedValue(new Error('保存失敗'));
    buildRecordSaveFailureStateMock.mockReturnValue({
      feedback: {
        message: '保存失敗',
        tone: 'error',
      },
    });

    const { handleConfirmDraft } = useRecordScreenSave({
      form: {
        getValues: vi.fn((name: string) => {
          if (name === 'recordedDate') return '2026-04-15';
          if (name === 'mealName') return '朝食';
          if (name === 'items') return [{ name: '卵' }];
          return '';
        }),
      } as never,
      workspaceMode: 'manual',
      draftOriginalText: '',
      replaceItems: vi.fn(),
      setIsSaving,
      setDraftOriginalText: vi.fn(),
      setWorkspaceMode: vi.fn(),
      setFeedback,
    });

    await handleConfirmDraft();

    expect(buildRecordSaveFailureStateMock).toHaveBeenCalled();
    expect(setFeedback).toHaveBeenCalledWith({
      message: '保存失敗',
      tone: 'error',
    });
    expect(setIsSaving).toHaveBeenLastCalledWith(false);
  });
});
