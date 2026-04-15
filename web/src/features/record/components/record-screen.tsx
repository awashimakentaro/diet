/* 【責務】
 * Record 画面の機能本体を描画する。流れを表現する
 */

'use client';

import { motion, useReducedMotion } from 'framer-motion';
import React from 'react';
import type { JSX } from 'react';

import { useRecordScreen } from '../hooks/use-record-screen';
import { RecordQuickInputSection } from './quick-input/record-quick-input-section';
import { RecordWorkspace } from './workspace/record-workspace';

export function RecordScreen(): JSX.Element {
  const reduceMotion = useReducedMotion();
  const {
    workspace,
    quickInput,
    prompt,
  } = useRecordScreen();

  const promptRegistration = workspace.form.register('prompt');
  const sectionTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.45, ease: 'easeOut' as const };
  const workspaceProps = {
    attachments: workspace.attachments,
    draftTotals: workspace.draftTotals,
    feedbackMessage: workspace.feedbackMessage,
    feedbackTone: workspace.feedbackTone,
    form: workspace.form,
    isAnalyzing: workspace.isAnalyzing,
    isSaving: workspace.isSaving,
    itemFields: workspace.itemFields,
    onAddItem: workspace.handleAddItem,
    onApplyPrompt: prompt.handleApplyPrompt,
    onAttachmentChange: workspace.handleAttachmentChange,
    onClose: workspace.handleCloseManualInput,
    onConfirm: workspace.handleConfirmDraft,
    onPhotoRecord: quickInput.handlePhotoRecord,
    onRemoveAttachment: workspace.handleRemoveAttachment,
    onRemoveItem: workspace.handleRemoveItem,
    promptRegistration,
    workspaceMode: workspace.workspaceMode,
  };
  const quickInputProps = {
    attachments: quickInput.attachments,
    isAnalyzing: quickInput.isAnalyzing,
    onApplyPrompt: prompt.handleApplyPrompt,
    onAttachmentChange: quickInput.handleAttachmentChange,
    onOpenManualInput: quickInput.handleOpenManualInput,
    onPhotoRecord: quickInput.handlePhotoRecord,
    onRemoveAttachment: quickInput.handleRemoveAttachment,
    promptRegistration,
    sectionTransition,
    workspaceMode: quickInput.workspaceMode,
  };

  return (
    <>
      <motion.main
        animate={{ opacity: 1, y: 0 }}
        className="record-screen__main record-screen__main--focused"
        initial={{ opacity: 0, y: 18 }}
        transition={sectionTransition}
      >
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="record-screen__workspace"
          initial={{ opacity: 0, y: 24 }}
          transition={{ ...sectionTransition, delay: reduceMotion ? 0 : 0.08 }}
        >
          <RecordWorkspace {...workspaceProps} />
        </motion.div>
      </motion.main>

      <RecordQuickInputSection {...quickInputProps} />
    </>
  );
}
