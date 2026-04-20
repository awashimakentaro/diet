/* 【責務】
 * Record 画面の保存実行フローを提供する。
 */

import * as Sentry from '@sentry/nextjs';

import type { MealFormValues as RecordFormValues } from '@/features/shared/meal-editor/schemas';
import { saveRecordMeal } from '../../api/save-record-meal';
import type { RecordMealRepository } from '../../types/record-meal-repository';
import {
  buildRecordSaveFailureState,
  buildRecordSaveSuccessState,
  resolveRecordSaveSource,
  validateRecordDraft,
} from '../../utils/save';
import { resetRecordDraftAfterSave } from '../../utils/reset-record-draft-after-save';
import { useRecordForm } from '../use-record-form';

type WorkspaceMode = 'idle' | 'manual' | 'generated';
type FeedbackTone = 'info' | 'error';

type UseRecordScreenSaveParams = {
  form: ReturnType<typeof useRecordForm>;
  workspaceMode: WorkspaceMode;
  draftOriginalText: string;
  replaceItems: (items: RecordFormValues['items']) => void;
  setIsSaving: (value: boolean) => void;
  setDraftOriginalText: (value: string) => void;
  setWorkspaceMode: (value: WorkspaceMode) => void;
  setFeedback: (feedback: { message: string | null; tone: FeedbackTone }) => void;
  mealRepository?: RecordMealRepository;
};

function buildRecordDraftValues(
  form: ReturnType<typeof useRecordForm>,
): Pick<RecordFormValues, 'recordedDate' | 'mealName' | 'items'> {
  return {
    recordedDate: form.getValues('recordedDate'),
    mealName: form.getValues('mealName'),
    items: form.getValues('items'),
  };
}

export function useRecordScreenSave({
  form,
  workspaceMode,
  draftOriginalText,
  replaceItems,
  setIsSaving,
  setDraftOriginalText,
  setWorkspaceMode,
  setFeedback,
  mealRepository = saveRecordMeal,
}: UseRecordScreenSaveParams): {
  handleConfirmDraft: () => Promise<void>;
} {
  async function handleConfirmDraft(): Promise<void> {
    const values = buildRecordDraftValues(form);
    const validation = validateRecordDraft(values);

    if (!validation.ok) {
      setFeedback({
        message: validation.error,
        tone: 'error',
      });
      return;
    }

    setIsSaving(true);

    try {
      await mealRepository.saveMeal({
        values,
        originalText: draftOriginalText,
        source: resolveRecordSaveSource(workspaceMode),
      });

      const nextState = buildRecordSaveSuccessState();
      resetRecordDraftAfterSave({
        form,
        replaceItems,
      });
      setDraftOriginalText(nextState.nextDraftOriginalText);
      setWorkspaceMode(nextState.nextWorkspaceMode);
      setFeedback(nextState.feedback);
    } catch (error) {
      Sentry.withScope((scope) => {
        scope.setTag('feature', 'record');
        scope.setTag('operation', 'save');
        scope.setExtra('workspaceMode', workspaceMode);
        scope.setExtra('recordedDate', values.recordedDate);
        scope.setExtra('itemCount', values.items.length);
        Sentry.captureException(error);
      });
      const nextState = buildRecordSaveFailureState(error);
      setFeedback(nextState.feedback);
    } finally {
      setIsSaving(false);
    }
  }

  return {
    handleConfirmDraft,
  };
}
