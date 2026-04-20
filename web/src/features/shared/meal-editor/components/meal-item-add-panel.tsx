/* 【責務】
 * 食事編集カードの食品追加パネル表示状態を切り替える。
 */

'use client';

import { useState, type ChangeEvent, type JSX } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

import type { PromptAttachment } from '../hooks/use-prompt-attachments';
import { MealItemAddMethodPanel } from './meal-item-add-method-panel';
import { MealItemAddPromptPanel } from './meal-item-add-prompt-panel';
import { MealItemAddTrigger } from './meal-item-add-trigger';

type AddPanelMode = 'closed' | 'chooser' | 'prompt';

export type MealItemAddPanelProps = {
  promptRegistration: UseFormRegisterReturn;
  isAnalyzing: boolean;
  onAddManualItem: () => void;
  onApplyPrompt: () => void | Promise<void>;
  onPhotoRecord: () => void;
  attachments: PromptAttachment[];
  onAttachmentChange: (event: ChangeEvent<HTMLInputElement>) => boolean;
  onRemoveAttachment: (attachmentId: string) => void;
};

export function MealItemAddPanel({
  promptRegistration,
  isAnalyzing,
  onAddManualItem,
  onApplyPrompt,
  onPhotoRecord,
  attachments,
  onAttachmentChange,
  onRemoveAttachment,
}: MealItemAddPanelProps): JSX.Element {
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
    return <MealItemAddTrigger onOpen={() => setMode('chooser')} />;
  }

  if (mode === 'chooser') {
    return (
      <MealItemAddMethodPanel
        onAddManualItem={handleAddManualItem}
        onClose={() => setMode('closed')}
        onOpenPrompt={() => setMode('prompt')}
      />
    );
  }

  return (
    <MealItemAddPromptPanel
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
