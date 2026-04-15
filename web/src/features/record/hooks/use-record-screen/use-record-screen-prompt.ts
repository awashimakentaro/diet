/* 【責務】
 * Record 画面の解析実行フローを提供する。
 */

import type { RecordAnalysisGateway } from '../../gateways/record-analysis-gateway';
import { httpRecordAnalysisGateway } from '../../infrastructure/http-record-analysis-gateway';
import type { RecordFormValues } from '../../schemas/record-form-schema';
import { applyRecordAnalysisToForm } from '../../usecases/analysis/apply-record-analysis';
import { buildRecordAnalysisFailureState } from '../../usecases/analysis/build-record-analysis-failure-state';
import { buildRecordAnalysisSuccessState } from '../../usecases/analysis/build-record-analysis-success-state';
import { convertRecordAttachmentsToBase64 } from '../../usecases/analysis/convert-record-attachments-to-base64';
import { validateRecordAnalysisInput } from '../../usecases/analysis/validate-record-analysis-input';
import { useRecordForm } from '../use-record-form';

type WorkspaceMode = 'idle' | 'manual' | 'generated';
type FeedbackTone = 'info' | 'error';

type UseRecordScreenPromptParams = {
  form: ReturnType<typeof useRecordForm>;
  prompt: string | undefined;
  items: RecordFormValues['items'] | undefined;
  attachments: {
    id: string;
    name: string;
    previewUrl: string;
  }[];
  workspaceMode: WorkspaceMode;
  draftOriginalText: string;
  replaceItems: (items: RecordFormValues['items']) => void;
  clearAttachments: () => void;
  setIsAnalyzing: (value: boolean) => void;
  setDraftOriginalText: (value: string) => void;
  setWorkspaceMode: (value: WorkspaceMode) => void;
  setFeedback: (feedback: { message: string | null; tone: FeedbackTone }) => void;
  analysisGateway?: RecordAnalysisGateway;
};

export function useRecordScreenPrompt({
  form,
  prompt,
  items,
  attachments,
  workspaceMode,
  draftOriginalText,
  replaceItems,
  clearAttachments,
  setIsAnalyzing,
  setDraftOriginalText,
  setWorkspaceMode,
  setFeedback,
  analysisGateway = httpRecordAnalysisGateway,
}: UseRecordScreenPromptParams): {
  handleApplyPrompt: () => Promise<void>;
} {
  async function handleApplyPrompt(): Promise<void> {
    const trimmedPrompt = (prompt ?? '').trim();
    const hasAttachments = attachments.length > 0;
    const validation = validateRecordAnalysisInput({
      prompt: trimmedPrompt,
      hasAttachments,
    });

    if (!validation.ok) {
      setFeedback({
        message: validation.message,
        tone: 'error',
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const imageUrls = await convertRecordAttachmentsToBase64(attachments);
      const draft = await analysisGateway.requestAnalysis({
        prompt: trimmedPrompt,
        images: imageUrls.length > 0 ? imageUrls : undefined,
      });
      const nextState = buildRecordAnalysisSuccessState({
        warning: draft.warnings[0] ?? null,
        hasAttachments,
        workspaceMode,
        mealName: form.getValues('mealName'),
        items: items ?? [],
        prompt: trimmedPrompt,
        currentOriginalText: draftOriginalText,
      });

      applyRecordAnalysisToForm({
        form,
        replaceItems,
        currentItems: nextState.analysisMode === 'append' ? items ?? [] : [],
        draft,
        mode: nextState.analysisMode,
      });
      setDraftOriginalText(nextState.nextOriginalText);
      setWorkspaceMode(nextState.nextWorkspaceMode);
      setFeedback(nextState.feedback);
      clearAttachments();
    } catch (error) {
      const nextState = buildRecordAnalysisFailureState({
        error,
        prompt: trimmedPrompt,
        currentMealName: form.getValues('mealName'),
        currentFirstItemName: form.getValues('items.0.name'),
        currentOriginalText: draftOriginalText,
      });

      if (nextState.fallback.nextMealName) {
        form.setValue('mealName', nextState.fallback.nextMealName);
      }

      if (nextState.fallback.nextFirstItemName) {
        form.setValue('items.0.name', nextState.fallback.nextFirstItemName);
      }

      setDraftOriginalText(nextState.fallback.nextOriginalText);
      setWorkspaceMode(nextState.nextWorkspaceMode);
      setFeedback(nextState.feedback);

      if (hasAttachments) {
        clearAttachments();
      }
    } finally {
      setIsAnalyzing(false);
    }
  }

  return {
    handleApplyPrompt,
  };
}
