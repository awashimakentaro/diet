'use client';

/**
 * web/src/app/app/record/_components/record-page-screen.tsx
 *
 * 【責務】
 * `/app/record` ルート専用の画面組み立てを担当し、トップバー・ワークスペース・クイック入力・下部ナビを配置する。
 *
 * 【使用されるエージェント / 処理フロー】
 * - web/src/app/app/record/page.tsx から呼ばれる。
 * - web/src/features/record/use-record-screen.ts の state を受け取り、route 専用 UI と feature 専用 UI を接続する。
 *
 * 【やらないこと】
 * - API 通信
 * - 永続化
 * - 共通 UI コンポーネントの定義
 *
 * 【他ファイルとの関係】
 * - route 専用 UI として record-quick-input-card.tsx / record-workspace-loading.tsx / record-workspace-placeholder.tsx を利用する。
 * - feature 専用 UI として web/src/features/record/components/record-editor-panel.tsx を利用する。
 * - 共通 UI として web/src/components/app-top-bar.tsx と app-bottom-nav.tsx を利用する。
 */

import { motion, useReducedMotion } from 'framer-motion';
import type { JSX } from 'react';

import { AppBottomNav } from '@/components/app-bottom-nav';
import { AppTopBar } from '@/components/app-top-bar';
import { RecordEditorPanel } from '@/features/record/components/record-editor-panel';
import { useRecordScreen } from '@/features/record/use-record-screen';

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
    promptGuideMessage,
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
            promptGuideMessage={promptGuideMessage}
            promptRegistration={form.register('prompt')}
          />
        </motion.div>
      ) : null}

      <AppBottomNav currentPath="/app/record" />
    </div>
  );
}
