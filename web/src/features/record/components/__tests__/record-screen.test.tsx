/* 【責務】
 * RecordScreen の画面組み立てを検証する。
 */

import { render, screen } from '@testing-library/react';
import React from 'react';
import type { ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { RecordScreen } from '../record-screen';

const useRecordScreenMock = vi.hoisted(() => vi.fn());
const recordWorkspaceMock = vi.hoisted(() => vi.fn());
const recordQuickInputSectionMock = vi.hoisted(() => vi.fn());

vi.mock('framer-motion', () => ({
  motion: {
    main: ({ children, ...props }: ComponentProps<'main'>) => <main {...props}>{children}</main>,
    div: ({ children, ...props }: ComponentProps<'div'>) => <div {...props}>{children}</div>,
  },
  useReducedMotion: () => false,
}));

vi.mock('../../hooks/use-record-screen', () => ({
  useRecordScreen: useRecordScreenMock,
}));

vi.mock('../workspace/record-workspace', () => ({
  RecordWorkspace: (props: unknown) => {
    recordWorkspaceMock(props);
    return <div data-testid="record-workspace" />;
  },
}));

vi.mock('../quick-input/record-quick-input-section', () => ({
  RecordQuickInputSection: (props: unknown) => {
    recordQuickInputSectionMock(props);
    return <div data-testid="record-quick-input-section" />;
  },
}));

describe('RecordScreen', () => {
  it('workspace と quick input に必要な props を渡す', () => {
    const promptRegistration = {
      name: 'prompt',
      onBlur: vi.fn(),
      onChange: vi.fn(),
      ref: vi.fn(),
    };
    const form = {
      register: vi.fn().mockReturnValue(promptRegistration),
    };
    const handleApplyPrompt = vi.fn();
    const handleAddItem = vi.fn();
    const handleAttachmentChange = vi.fn();
    const handleCloseManualInput = vi.fn();
    const handleConfirmDraft = vi.fn();
    const handleOpenManualInput = vi.fn();
    const handlePhotoRecord = vi.fn();
    const handleRemoveAttachment = vi.fn();
    const handleRemoveItem = vi.fn();

    useRecordScreenMock.mockReturnValue({
      workspace: {
        form,
        itemFields: [{ id: '1' }],
        workspaceMode: 'idle',
        isAnalyzing: false,
        isSaving: false,
        attachments: [{ id: 'a', name: 'photo', previewUrl: 'blob:a' }],
        draftTotals: { kcal: 100, protein: 10, fat: 5, carbs: 12 },
        feedbackMessage: 'ok',
        feedbackTone: 'info',
        handleCloseManualInput,
        handleAttachmentChange,
        handleRemoveAttachment,
        handleAddItem,
        handleRemoveItem,
        handleConfirmDraft,
      },
      quickInput: {
        workspaceMode: 'idle',
        isAnalyzing: false,
        attachments: [{ id: 'a', name: 'photo', previewUrl: 'blob:a' }],
        handleOpenManualInput,
        handlePhotoRecord,
        handleAttachmentChange,
        handleRemoveAttachment,
      },
      prompt: {
        handleApplyPrompt,
      },
    });

    render(<RecordScreen />);

    expect(screen.getByTestId('record-workspace')).toBeInTheDocument();
    expect(screen.getByTestId('record-quick-input-section')).toBeInTheDocument();
    expect(form.register).toHaveBeenCalledWith('prompt');
    expect(recordWorkspaceMock).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceMode: 'idle',
        isAnalyzing: false,
        isSaving: false,
        draftTotals: { kcal: 100, protein: 10, fat: 5, carbs: 12 },
        feedbackMessage: 'ok',
        feedbackTone: 'info',
        onApplyPrompt: handleApplyPrompt,
        onAddItem: handleAddItem,
        onAttachmentChange: handleAttachmentChange,
        onClose: handleCloseManualInput,
        onConfirm: handleConfirmDraft,
        onPhotoRecord: handlePhotoRecord,
        onRemoveAttachment: handleRemoveAttachment,
        onRemoveItem: handleRemoveItem,
        promptRegistration,
      }),
    );
    expect(recordQuickInputSectionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceMode: 'idle',
        isAnalyzing: false,
        attachments: [{ id: 'a', name: 'photo', previewUrl: 'blob:a' }],
        onApplyPrompt: handleApplyPrompt,
        onAttachmentChange: handleAttachmentChange,
        onOpenManualInput: handleOpenManualInput,
        onPhotoRecord: handlePhotoRecord,
        onRemoveAttachment: handleRemoveAttachment,
        promptRegistration,
      }),
    );
  });
});
