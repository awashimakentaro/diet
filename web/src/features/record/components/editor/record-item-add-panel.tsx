/* 【責務】
 * Record 編集カードの食品追加パネル表示状態を切り替える。
 */

'use client';

import { useState, type ChangeEvent, type JSX } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

import { type PromptAttachment } from '../../hooks/use-prompt-attachments';
import { RecordItemAddMethodPanel } from './record-item-add-method-panel';
import { RecordItemAddPromptPanel } from './record-item-add-prompt-panel';
import { RecordItemAddTrigger } from './record-item-add-trigger';

type AddPanelMode = 'closed' | 'chooser' | 'prompt';

type RecordItemAddPanelProps = {
  promptRegistration: UseFormRegisterReturn;
  isAnalyzing: boolean;
  onAddManualItem: () => void;
  onApplyPrompt: () => void | Promise<void>;
  onPhotoRecord: () => void;
  attachments: PromptAttachment[];
  onAttachmentChange: (event: ChangeEvent<HTMLInputElement>) => boolean;
  onRemoveAttachment: (attachmentId: string) => void;
};

export function RecordItemAddPanel({
  promptRegistration,
  isAnalyzing,
  onAddManualItem,
  onApplyPrompt,
  onPhotoRecord,
  attachments,
  onAttachmentChange,
  onRemoveAttachment,
}: RecordItemAddPanelProps): JSX.Element {
  const [mode, setMode] = useState<AddPanelMode>('closed');

  function handleAddManualItem(): void {
    onAddManualItem();
    setMode('closed');
  }

  async function handleApplyPrompt(): Promise<void> {
    await onApplyPrompt();
    setMode('closed');
  }

  if (mode === 'closed') {
    return <RecordItemAddTrigger onOpen={() => setMode('chooser')} />;
  }

  if (mode === 'chooser') {
    return (
      <RecordItemAddMethodPanel
        onAddManualItem={handleAddManualItem}
        onClose={() => setMode('closed')}
        onOpenPrompt={() => setMode('prompt')}
      />
    );
  }

  return (
    <RecordItemAddPromptPanel
      attachments={attachments}
      isAnalyzing={isAnalyzing}
      onApplyPrompt={handleApplyPrompt}
      onAttachmentChange={onAttachmentChange}
      onBack={() => setMode('chooser')}
      onPhotoRecord={onPhotoRecord}
      onRemoveAttachment={onRemoveAttachment}
      promptRegistration={promptRegistration}
    />
  );
}
