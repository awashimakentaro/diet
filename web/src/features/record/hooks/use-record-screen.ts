/* 【責務】
 * Record 画面のローカル state とフォーム編集状態をまとめる。
 */

import { useMemo, useState } from 'react';
import { useFieldArray, useWatch } from 'react-hook-form';
import { requestRecordAnalysis } from '../api/request-record-analysis';
import { saveRecordMeal } from '../api/save-record-meal';
import { type RecordFormValues } from '../schemas/record-form-schema';
import { applyRecordAnalysisToForm } from '../usecases/record/analysis/apply-record-analysis';
import { buildNextRecordOriginalText } from '../usecases/record/analysis/build-next-record-original-text';
import { buildRecordAnalysisErrorFeedback } from '../usecases/record/analysis/build-record-analysis-error-feedback';
import { buildRecordAnalysisFallback } from '../usecases/record/analysis/build-record-analysis-fallback';
import { buildRecordAnalysisFeedback } from '../usecases/record/analysis/build-record-analysis-feedback';
import { convertRecordAttachmentsToBase64 } from '../usecases/record/analysis/convert-record-attachments-to-base64';
import { resolveRecordAnalysisMode } from '../usecases/record/analysis/resolve-record-analysis-mode';
import { buildRecordSaveErrorFeedback } from '../usecases/record/save/build-record-save-error-feedback';
import { buildRecordSaveSuccessFeedback } from '../usecases/record/save/build-record-save-success-feedback';
import { resolveRecordSaveSource } from '../usecases/record/save/resolve-record-save-source';
import { validateRecordAnalysisInput } from '../usecases/record/analysis/validate-record-analysis-input';
import { validateRecordDraft } from '../usecases/record/save/validate-record-draft';
import { createEmptyRecordItem } from '../utils/create-empty-record-item';
import { resetRecordDraftAfterSave } from '../utils/reset-record-draft-after-save';
import { usePromptAttachments } from './use-prompt-attachments';
import { useRecordForm } from './use-record-form';

function toNumber(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

type WorkspaceMode = 'idle' | 'manual' | 'generated';
type FeedbackTone = 'info' | 'error';

export type UseRecordScreenResult = {
  form: ReturnType<typeof useRecordForm>;
  itemFields: ReturnType<typeof useFieldArray<RecordFormValues, 'items'>>['fields'];
  workspaceMode: WorkspaceMode;
  isAnalyzing: boolean;
  isSaving: boolean;
  attachments: ReturnType<typeof usePromptAttachments>['attachments'];
  draftTotals: {
    kcal: number;
    protein: number;
    fat: number;
    carbs: number;
  };
  feedbackMessage: string | null;
  feedbackTone: FeedbackTone;
  handleApplyPrompt: () => void;
  handleOpenManualInput: () => void;
  handleCloseManualInput: () => void;
  handlePhotoRecord: () => void;
  handleAttachmentChange: ReturnType<typeof usePromptAttachments>['handleAttachmentChange'];
  handleRemoveAttachment: ReturnType<typeof usePromptAttachments>['handleRemoveAttachment'];
  handleAddItem: () => void;
  handleRemoveItem: (index: number) => void;
  handleConfirmDraft: () => void;
};

export function useRecordScreen(): UseRecordScreenResult {
  const form = useRecordForm();
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>('idle');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [feedbackTone, setFeedbackTone] = useState<FeedbackTone>('info');
  const [draftOriginalText, setDraftOriginalText] = useState('');
  const { attachments, handleAttachmentChange, handleRemoveAttachment, clearAttachments } = usePromptAttachments();
  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const prompt = useWatch({ control: form.control, name: 'prompt' });//rhfのuseWatchは、フォームの入力値を監視する
  const items = useWatch({ control: form.control, name: 'items' });

  const draftTotals = useMemo(() => {
    return (items ?? []).reduce(
      (totals, item) => ({
        kcal: totals.kcal + toNumber(item.kcal),
        protein: totals.protein + toNumber(item.protein),
        fat: totals.fat + toNumber(item.fat),
        carbs: totals.carbs + toNumber(item.carbs),
      }),
      { kcal: 0, protein: 0, fat: 0, carbs: 0 },
    );
  }, [items]);

  async function handleApplyPrompt(): Promise<void> {
    const trimmedPrompt = prompt.trim();
    const hasAttachments = attachments.length > 0;
    const validation = validateRecordAnalysisInput({
      prompt: trimmedPrompt,
      hasAttachments,
    });

    if (!validation.ok) {
      setFeedbackMessage(validation.message);
      setFeedbackTone('error');
      return;
    }

    setIsAnalyzing(true);

    try {
      const imageUrls = await convertRecordAttachmentsToBase64(attachments);

      const draft = await requestRecordAnalysis({
        prompt: trimmedPrompt,
        images: imageUrls.length > 0 ? imageUrls : undefined,
      });

      const analysisMode = resolveRecordAnalysisMode({
        workspaceMode,
        mealName: form.getValues('mealName'),
        items: items ?? [],
      });
      applyRecordAnalysisToForm({
        form,
        replaceItems: replace,
        currentItems: analysisMode === 'append' ? items ?? [] : [],//analysisMode === 'append' ならcurrentItems に items ?? [] を入れるそうでなければcurrentItems に [] を入れる. items ?? [] は items が null や undefined じゃなければ items そうでなければ [] を返す
        draft,
        mode: analysisMode,
      });
      setDraftOriginalText( 
        buildNextRecordOriginalText({
          currentOriginalText: draftOriginalText,
          prompt: trimmedPrompt,
          analysisMode,
        }),
      );

      setWorkspaceMode('generated');
      const feedback = buildRecordAnalysisFeedback({
        warning: draft.warnings[0] ?? null,
        analysisMode,
        hasAttachments,
      });
      setFeedbackMessage(feedback.message);
      setFeedbackTone(feedback.tone);
      clearAttachments();
    } catch (error) {
      const fallback = buildRecordAnalysisFallback({
        prompt: trimmedPrompt,
        currentMealName: form.getValues('mealName'),
        currentFirstItemName: form.getValues('items.0.name'),
        currentOriginalText: draftOriginalText,
      });
      if (fallback.nextMealName) {
        form.setValue('mealName', fallback.nextMealName);
      }

      if (fallback.nextFirstItemName) {
        form.setValue('items.0.name', fallback.nextFirstItemName);
      }

      setDraftOriginalText(fallback.nextOriginalText);

      setWorkspaceMode('generated');
      const feedback = buildRecordAnalysisErrorFeedback(error);
      setFeedbackMessage(feedback.message);
      setFeedbackTone(feedback.tone);

      if (hasAttachments) {
        clearAttachments();
      }
    } finally {
      setIsAnalyzing(false);
    }
  }

  function handlePhotoRecord(): void {
    setFeedbackMessage(null);
    setFeedbackTone('info');
  }

  function handleOpenManualInput(): void {
    setWorkspaceMode('manual');
    setDraftOriginalText('');
    setFeedbackMessage(null);
    setFeedbackTone('info');
  }

  function handleCloseManualInput(): void {
    setWorkspaceMode('idle');
    setDraftOriginalText('');
    setFeedbackMessage(null);
    setFeedbackTone('info');
  }

  function handleAddItem(): void {
    append(createEmptyRecordItem());
    setFeedbackMessage(null);
    setFeedbackTone('info');
  }

  function handleRemoveItem(index: number): void {
    if (fields.length <= 1) {
      return;
    }

    remove(index);
    setFeedbackMessage(null);
    setFeedbackTone('info');
  }

  async function handleConfirmDraft(): Promise<void> {
    const values = {
      recordedDate: form.getValues('recordedDate'),
      mealName: form.getValues('mealName'),
      items: form.getValues('items'),
    };
    const validation = validateRecordDraft(values);
    if (!validation.ok) {
      setFeedbackMessage(validation.error);
      setFeedbackTone('error');
      return;
    }
    setIsSaving(true);

    try {
      await saveRecordMeal({
        values,
        originalText: draftOriginalText,
        source: resolveRecordSaveSource(workspaceMode),
      });

      resetRecordDraftAfterSave({
        form,
        replaceItems: replace,
      });
      setDraftOriginalText('');
      setWorkspaceMode('idle');
      const feedback = buildRecordSaveSuccessFeedback();
      setFeedbackMessage(feedback.message);
      setFeedbackTone(feedback.tone);
    } catch (error) {
      const feedback = buildRecordSaveErrorFeedback(error);
      setFeedbackMessage(feedback.message);
      setFeedbackTone(feedback.tone);
    } finally {
      setIsSaving(false);
    }
  }//そもそもhooksは画面の状態を持って、どの順番で何をするかをつなぐ場所だから別の場所にある関数をまとめて流れを再現する場所のため今refactしてる

  return {
    form,
    itemFields: fields,
    workspaceMode,
    isAnalyzing,
    isSaving,
    attachments,
    draftTotals,
    feedbackMessage,
    feedbackTone,
    handleApplyPrompt,
    handleOpenManualInput,
    handleCloseManualInput,
    handlePhotoRecord,
    handleAttachmentChange,
    handleRemoveAttachment,
    handleAddItem,
    handleRemoveItem,
    handleConfirmDraft,
  };
}

// - append
//     すでに何か入ってるカードに、AI結果を追加する
//   - replace
//     まだ実質空のカードなので、AI結果で入れ替える　まぁ初めてプロンプト打った時ってことだね

//   append になるのは、
//   - manual で手入力中のカードに中身があるとき
//   - generated でAI作成済みカードに中身があるとき

//   replace になるのは、
//   - idle のときカードはあるけど中身がほぼ空のとき
