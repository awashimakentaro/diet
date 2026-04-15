/* 【責務】
 * useRecordScreenPrompt の振る舞いを検証する。
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useRecordForm } from '../../use-record-form';
import { useRecordScreenPrompt } from '../use-record-screen-prompt';

const requestRecordAnalysisMock = vi.hoisted(() => vi.fn());
const applyRecordAnalysisToFormMock = vi.hoisted(() => vi.fn());
const buildRecordAnalysisFailureStateMock = vi.hoisted(() => vi.fn());
const buildRecordAnalysisSuccessStateMock = vi.hoisted(() => vi.fn());
const convertRecordAttachmentsToBase64Mock = vi.hoisted(() => vi.fn());

vi.mock('../../../usecases/analysis/apply-record-analysis', () => ({
  applyRecordAnalysisToForm: applyRecordAnalysisToFormMock,
}));

vi.mock('../../../usecases/analysis/build-record-analysis-failure-state', () => ({
  buildRecordAnalysisFailureState: buildRecordAnalysisFailureStateMock,
}));

vi.mock('../../../usecases/analysis/build-record-analysis-success-state', () => ({
  buildRecordAnalysisSuccessState: buildRecordAnalysisSuccessStateMock,
}));

vi.mock('../../../usecases/analysis/convert-record-attachments-to-base64', () => ({
  convertRecordAttachmentsToBase64: convertRecordAttachmentsToBase64Mock,
}));

vi.mock('../../../infrastructure/http-record-analysis-gateway', () => ({
  httpRecordAnalysisGateway: {
    requestAnalysis: requestRecordAnalysisMock,
  },
}));

type PromptForm = Pick<ReturnType<typeof useRecordForm>, 'getValues' | 'setValue'>;

describe('useRecordScreenPrompt', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('入力が無効なら error feedback を返して解析を開始しない', async () => {
    const setFeedback = vi.fn();
    const setIsAnalyzing = vi.fn();

    const { handleApplyPrompt } = useRecordScreenPrompt({
      form: {
        getValues: vi.fn(),
        setValue: vi.fn(),
      } as unknown as PromptForm as ReturnType<typeof useRecordForm>,
      prompt: '   ',
      items: [],
      attachments: [],
      workspaceMode: 'idle',
      draftOriginalText: '',
      replaceItems: vi.fn(),
      clearAttachments: vi.fn(),
      setIsAnalyzing,
      setDraftOriginalText: vi.fn(),
      setWorkspaceMode: vi.fn(),
      setFeedback,
    });

    await handleApplyPrompt();

    expect(setFeedback).toHaveBeenCalledWith({
      message: '食事内容または写真を追加すると、下の編集欄へ下書きを反映できます。',
      tone: 'error',
    });
    expect(setIsAnalyzing).not.toHaveBeenCalled();
  });

  it('解析成功時は success state に従って反映する', async () => {
    const form = {
      getValues: vi.fn((name: string) => {
        if (name === 'mealName') return '既存食事';
        return '';
      }),
      setValue: vi.fn(),
    } as unknown as PromptForm as ReturnType<typeof useRecordForm>;
    const replaceItems = vi.fn();
    const clearAttachments = vi.fn();
    const setIsAnalyzing = vi.fn();
    const setDraftOriginalText = vi.fn();
    const setWorkspaceMode = vi.fn();
    const setFeedback = vi.fn();

    convertRecordAttachmentsToBase64Mock.mockResolvedValue(['base64-image']);
    requestRecordAnalysisMock.mockResolvedValue({
      menuName: '昼食',
      originalText: '卵',
      items: [{ name: '卵', amount: '1個', kcal: 80, protein: 6, fat: 5, carbs: 0.2 }],
      warnings: [],
      source: 'text',
    });
    buildRecordAnalysisSuccessStateMock.mockReturnValue({
      analysisMode: 'append',
      nextOriginalText: '既存\n卵',
      nextWorkspaceMode: 'generated',
      feedback: {
        message: 'AI が推定した食品候補を既存カードへ追加しました。',
        tone: 'info',
      },
    });

    const { handleApplyPrompt } = useRecordScreenPrompt({
      form,
      prompt: '卵',
      items: [{ name: 'ごはん', amount: '100g', kcal: '156', protein: '2.5', fat: '0.3', carbs: '35.6' }],
      attachments: [{ id: '1', name: 'photo', previewUrl: 'blob:1' }],
      workspaceMode: 'manual',
      draftOriginalText: '既存',
      replaceItems,
      clearAttachments,
      setIsAnalyzing,
      setDraftOriginalText,
      setWorkspaceMode,
      setFeedback,
    });

    await handleApplyPrompt();

    expect(setIsAnalyzing).toHaveBeenNthCalledWith(1, true);
    expect(convertRecordAttachmentsToBase64Mock).toHaveBeenCalledWith([
      { id: '1', name: 'photo', previewUrl: 'blob:1' },
    ]);
    expect(requestRecordAnalysisMock).toHaveBeenCalledWith({
      prompt: '卵',
      images: ['base64-image'],
    });
    expect(buildRecordAnalysisSuccessStateMock).toHaveBeenCalled();
    expect(applyRecordAnalysisToFormMock).toHaveBeenCalledWith({
      form,
      replaceItems,
      currentItems: [{ name: 'ごはん', amount: '100g', kcal: '156', protein: '2.5', fat: '0.3', carbs: '35.6' }],
      draft: {
        menuName: '昼食',
        originalText: '卵',
        items: [{ name: '卵', amount: '1個', kcal: 80, protein: 6, fat: 5, carbs: 0.2 }],
        warnings: [],
        source: 'text',
      },
      mode: 'append',
    });
    expect(setDraftOriginalText).toHaveBeenCalledWith('既存\n卵');
    expect(setWorkspaceMode).toHaveBeenCalledWith('generated');
    expect(setFeedback).toHaveBeenCalledWith({
      message: 'AI が推定した食品候補を既存カードへ追加しました。',
      tone: 'info',
    });
    expect(clearAttachments).toHaveBeenCalled();
    expect(setIsAnalyzing).toHaveBeenLastCalledWith(false);
  });

  it('解析失敗時は failure state に従って fallback を反映する', async () => {
    const form = {
      getValues: vi.fn((name: string) => {
        if (name === 'mealName') return '';
        if (name === 'items.0.name') return '';
        return '';
      }),
      setValue: vi.fn(),
    } as unknown as PromptForm as ReturnType<typeof useRecordForm>;
    const setDraftOriginalText = vi.fn();
    const setWorkspaceMode = vi.fn();
    const setFeedback = vi.fn();
    const clearAttachments = vi.fn();
    const setIsAnalyzing = vi.fn();

    convertRecordAttachmentsToBase64Mock.mockResolvedValue([]);
    requestRecordAnalysisMock.mockRejectedValue(new Error('解析失敗'));
    buildRecordAnalysisFailureStateMock.mockReturnValue({
      fallback: {
        nextMealName: '朝食',
        nextFirstItemName: '卵',
        nextOriginalText: '卵',
      },
      nextWorkspaceMode: 'generated',
      feedback: {
        message: '解析失敗',
        tone: 'error',
      },
    });

    const { handleApplyPrompt } = useRecordScreenPrompt({
      form,
      prompt: '卵',
      items: [],
      attachments: [{ id: '1', name: 'photo', previewUrl: 'blob:1' }],
      workspaceMode: 'idle',
      draftOriginalText: '',
      replaceItems: vi.fn(),
      clearAttachments,
      setIsAnalyzing,
      setDraftOriginalText,
      setWorkspaceMode,
      setFeedback,
    });

    await handleApplyPrompt();

    expect(buildRecordAnalysisFailureStateMock).toHaveBeenCalled();
    expect(form.setValue).toHaveBeenCalledWith('mealName', '朝食');
    expect(form.setValue).toHaveBeenCalledWith('items.0.name', '卵');
    expect(setDraftOriginalText).toHaveBeenCalledWith('卵');
    expect(setWorkspaceMode).toHaveBeenCalledWith('generated');
    expect(setFeedback).toHaveBeenCalledWith({
      message: '解析失敗',
      tone: 'error',
    });
    expect(clearAttachments).toHaveBeenCalled();
    expect(setIsAnalyzing).toHaveBeenLastCalledWith(false);
  });
});
