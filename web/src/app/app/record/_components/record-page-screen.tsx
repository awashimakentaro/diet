'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { JSX } from 'react';

import { AppBottomNav } from '@/components/app-bottom-nav';
import { AppTopBar } from '@/components/app-top-bar';
import { RecordEditorPanel } from '@/features/record/components/record-editor-panel';
import { useRecordScreen } from '@/features/record/hooks/use-record-screen';

import { RecordQuickInputCard } from './record-quick-input-card';
import { RecordWorkspaceLoading } from './record-workspace-loading';
import { RecordWorkspacePlaceholder } from './record-workspace-placeholder';

export function RecordPageScreen(): JSX.Element {
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
    <div className="record-screen">
      <AppTopBar />

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
          {isWorkspaceLoading ? (
            <RecordWorkspaceLoading />
          ) : workspaceMode === 'idle' ? (
            <RecordWorkspacePlaceholder />
          ) : (
            <RecordEditorPanel
              attachments={attachments}
              draftTotals={draftTotals}
              feedbackMessage={feedbackMessage}
              feedbackTone={feedbackTone}
              form={form}
              isAnalyzing={isAnalyzing}
              isSaving={isSaving}
              itemFields={itemFields}
              mode={workspaceMode}
              onAddItem={handleAddItem}
              onApplyPrompt={handleApplyPrompt}
              onAttachmentChange={handleAttachmentChange}
              onClose={handleCloseManualInput}
              onConfirm={handleConfirmDraft}
              onPhotoRecord={handlePhotoRecord}
              onRemoveAttachment={handleRemoveAttachment}
              onRemoveItem={handleRemoveItem}
              promptRegistration={form.register('prompt')}
            />
          )}
        </motion.div>
      </motion.main>

      {workspaceMode === 'idle' && !isAnalyzing ? (
        <motion.div
          animate={{ opacity: 1 }}
          initial={{ opacity: 0 }}
          transition={sectionTransition}
        >
          <RecordQuickInputCard
            attachments={attachments}
            isAnalyzing={isAnalyzing}
            onApplyPrompt={handleApplyPrompt}
            onAttachmentChange={handleAttachmentChange}
            onOpenManualInput={handleOpenManualInput}
            onPhotoRecord={handlePhotoRecord}
            onRemoveAttachment={handleRemoveAttachment}
            promptRegistration={form.register('prompt')}
          />
        </motion.div>
      ) : null}

      <AppBottomNav currentPath="/app/record" />
    </div>
  );
}
