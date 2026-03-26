'use client';

/**
 * web/src/features/record/record-screen.tsx
 *
 * 【責務】
 * Record 画面全体のトップバー、下部入力、ワークスペース、下部ナビを組み立てる。
 *
 * 【使用されるエージェント / 処理フロー】
 * - web/src/app/app/record/page.tsx から呼ばれる。
 * - use-record-screen.ts の state と各 UI コンポーネントを接続する。
 *
 * 【やらないこと】
 * - API 通信
 * - 永続化
 * - ルート保護
 *
 * 【他ファイルとの関係】
 * - components 配下の record UI コンポーネントを利用する。
 * - use-record-screen.ts に依存する。
 */

import { motion, useReducedMotion } from 'framer-motion';
import type { JSX } from 'react';

import { AppBottomNav } from '@/components/app-bottom-nav';
import { AppTopBar } from '@/components/app-top-bar';

import { RecordEditorPanel } from './components/record-editor-panel';
import { RecordQuickInputCard } from './components/record-quick-input-card';
import { RecordWorkspaceLoading } from './components/record-workspace-loading';
import { RecordWorkspacePlaceholder } from './components/record-workspace-placeholder';
import { useRecordScreen } from './use-record-screen';

export function RecordScreen(): JSX.Element {
  const reduceMotion = useReducedMotion();
  const {
    form,
    itemFields,
    workspaceMode,
    isAnalyzing,
    isSaving,
    promptGuideMessage,
    draftTotals,
    feedbackMessage,
    feedbackTone,
    handleApplyPrompt,
    handleOpenManualInput,
    handleCloseManualInput,
    handlePhotoRecord,
    handleAddItem,
    handleRemoveItem,
    handleConfirmDraft,
  } = useRecordScreen();
  const isWorkspaceLoading = isAnalyzing && workspaceMode === 'idle';
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
              mode={workspaceMode}
              draftTotals={draftTotals}
              feedbackMessage={feedbackMessage}
              feedbackTone={feedbackTone}
              form={form}
              isAnalyzing={isAnalyzing}
              isSaving={isSaving}
              itemFields={itemFields}
              onAddItem={handleAddItem}
              onApplyPrompt={handleApplyPrompt}
              onPhotoRecord={handlePhotoRecord}
              onClose={handleCloseManualInput}
              onConfirm={handleConfirmDraft}
              onRemoveItem={handleRemoveItem}
              promptRegistration={form.register('prompt')}
            />
          )}
        </motion.div>
      </motion.main>

      {workspaceMode === 'idle' ? (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 18 }}
          transition={{ ...sectionTransition, delay: reduceMotion ? 0 : 0.12 }}
        >
          <RecordQuickInputCard
            isAnalyzing={isAnalyzing}
            onApplyPrompt={handleApplyPrompt}
            onOpenManualInput={handleOpenManualInput}
            onPhotoRecord={handlePhotoRecord}
            promptGuideMessage={promptGuideMessage}
            promptRegistration={form.register('prompt')}
          />
        </motion.div>
      ) : null}

      <AppBottomNav currentPath="/app/record" />
    </div>
  );
}
