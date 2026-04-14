/* 【責務】
 * Record 画面のクイック入力セクションを表示条件に応じて描画する。
 */

'use client';

import { motion } from 'framer-motion';
import type { ChangeEvent, JSX } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

import type { PromptAttachment } from '../../hooks/use-prompt-attachments';
import { RecordQuickInputCard } from './record-quick-input-card';

type RecordQuickInputSectionProps = {
  workspaceMode: 'idle' | 'manual' | 'generated';
  isAnalyzing: boolean;
  attachments: PromptAttachment[];
  onApplyPrompt: () => void;
  onAttachmentChange: (event: ChangeEvent<HTMLInputElement>) => boolean;
  onOpenManualInput: () => void;
  onPhotoRecord: () => void;
  onRemoveAttachment: (attachmentId: string) => void;
  promptRegistration: UseFormRegisterReturn;
  sectionTransition: { duration: number; ease?: 'easeOut' };
};

export function RecordQuickInputSection({
  workspaceMode,
  isAnalyzing,
  attachments,
  onApplyPrompt,
  onAttachmentChange,
  onOpenManualInput,
  onPhotoRecord,
  onRemoveAttachment,
  promptRegistration,
  sectionTransition,
}: RecordQuickInputSectionProps): JSX.Element | null {
  if (workspaceMode !== 'idle' || isAnalyzing) {
    return null;
  }

  return (
    <motion.div
      animate={{ opacity: 1 }}
      initial={{ opacity: 0 }}
      transition={sectionTransition}
    >
      <RecordQuickInputCard
        attachments={attachments}
        isAnalyzing={isAnalyzing}
        onApplyPrompt={onApplyPrompt}
        onAttachmentChange={onAttachmentChange}
        onOpenManualInput={onOpenManualInput}
        onPhotoRecord={onPhotoRecord}
        onRemoveAttachment={onRemoveAttachment}
        promptRegistration={promptRegistration}
      />
    </motion.div>
  );
}
