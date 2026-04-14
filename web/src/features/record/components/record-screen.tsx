/* 【責務】
 * Record 画面の機能本体を描画する。流れを表現する
 */

'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { JSX } from 'react';

import { useRecordScreen } from '../hooks/use-record-screen';
import { RecordQuickInputSection } from './record-quick-input-section';
import { RecordWorkspace } from './record-workspace';

export function RecordScreen(): JSX.Element {
  const reduceMotion = useReducedMotion();
  const {
    form,
    itemFields,
    workspaceMode,
    isAnalyzing,
    isSaving,
    draftTotals,
    feedbackMessage,
    feedbackTone,
    attachments,
    handleAttachmentChange,
    handleRemoveAttachment,
    handleApplyPrompt,
    handleOpenManualInput,
    handleCloseManualInput,
    handlePhotoRecord,
    handleAddItem,
    handleRemoveItem,
    handleConfirmDraft,
  } = useRecordScreen();

  const isWorkspaceLoading = isAnalyzing;
  const sectionTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.45, ease: 'easeOut' as const };

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
          <RecordWorkspace
            attachments={attachments}
            draftTotals={draftTotals}
            feedbackMessage={feedbackMessage}
            feedbackTone={feedbackTone}
            form={form}
            isAnalyzing={isAnalyzing}
            isSaving={isSaving}
            itemFields={itemFields}
            onAddItem={handleAddItem}
            onApplyPrompt={handleApplyPrompt}
            onAttachmentChange={handleAttachmentChange}
            onClose={handleCloseManualInput}
            onConfirm={handleConfirmDraft}
            onPhotoRecord={handlePhotoRecord}
            onRemoveAttachment={handleRemoveAttachment}
            onRemoveItem={handleRemoveItem}
            promptRegistration={form.register('prompt')}
            workspaceMode={workspaceMode}
          />
        </motion.div>
      </motion.main>

      <RecordQuickInputSection
        attachments={attachments}
        isAnalyzing={isAnalyzing}
        onApplyPrompt={handleApplyPrompt}
        onAttachmentChange={handleAttachmentChange}
        onOpenManualInput={handleOpenManualInput}
        onPhotoRecord={handlePhotoRecord}
        onRemoveAttachment={handleRemoveAttachment}
        promptRegistration={form.register('prompt')}
        sectionTransition={sectionTransition}
        workspaceMode={workspaceMode}
      />
    </>
  );
}
